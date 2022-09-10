const dayjs = require('dayjs');

const Team = require('./Team');

module.exports = class Game {
	onStateChange = null;

	id = null;
	champions = null;
	teams = null;
	expiration = dayjs().add(24, 'hour');

	roundExpiration = null;

	bans = [[], []];
	picks = [[], []];

	hover = [null, null];
	ready = [false, false];

	lastHover = null;

	order = [
		[0, 'ban'],
		[1, 'ban'],
		[0, 'ban'],
		[1, 'ban'],
		[0, 'ban'],
		[1, 'ban'],
		[0, 'pick'],
		[1, 'pick'],
		[1, 'pick'],
		[0, 'pick'],
		[0, 'pick'],
		[1, 'pick'],
		[1, 'ban'],
		[0, 'ban'],
		[1, 'ban'],
		[0, 'ban'],
		[1, 'pick'],
		[0, 'pick'],
		[0, 'pick'],
		[1, 'pick'],
		[null, 'done'],
	];
	current = 0;

	serialize() {
		return {
			teams: this.getTeams().map(team => team.serialize()),
			bans: this.bans,
			picks: this.picks,
			hover: this.hover,
			ready: this.ready,
			order: this.order,
			current: this.current,
			expiration: Number(this.expiration),
			roundExpiration: this.roundExpiration === null ? null : Number(this.roundExpiration),
		};
	}

	static unserialize(id, data, champions, onStateChange) {
		const game = new Game(null, ['', ''], champions, onStateChange);

		game.id = id;
		game.teams = data.teams.map(team => Team.unserialize(team));

		for(let key of ['bans', 'picks', 'hover', 'ready', 'order', 'current']) {
			game[key] = data[key];
		}

		game.expiration = dayjs(data.expiration);
		game.roundExpiration = data.roundExpiration === null ? null : dayjs(data.roundExpiration);

		setImmediate(() => game.resumeRound());

		return game;
	}

	constructor(generateId, teamNames, champions, onStateChange) {
		if(generateId !== null) {
			this.id = generateId();
		}
		this.champions = champions;
		this.teams = [
			new Team(generateId, teamNames[0]),
			new Team(generateId, teamNames[1]),
		];

		this.onStateChange = onStateChange;
	}

	getExpiration() {
		return this.expiration;
	}

	getId() {
		return this.id;
	}

	getState() {
		return {
			id: this.id,

			ready: this.ready,
			hover: this.hover,
			bans: this.bans,
			picks: this.picks,

			roundExpiration: Number(this.roundExpiration),

			order: this.order,
			current: this.current,

			teams: this.teams.map(team => ({ name: team.getName() })),
		};
	}

	getTeams() {
		return this.teams;
	}

	getTeamIndexById(id) {
		for(let index = 0; index < this.teams.length; ++index) {
			if(this.teams[index].getId() === id) {
				return index;
			}
		}

		return null;
	}

	getTeamById(id) {
		const index = this.getTeamIndexById(id);

		return index === null ? null : this.teams[index];
	}

	endRound() {
		this.roundExpiration = null;
		clearTimeout(this.roundTimeout);
	}

	startRound() {
		this.endRound();

		const ROUND_LENGTH_SECONDS = 33;

		this.roundExpiration = dayjs().add(ROUND_LENGTH_SECONDS, 'second');
		this.roundTimeout = setTimeout(() => this.autoAct(this.order[this.current][1]), ROUND_LENGTH_SECONDS * 1000);
	}

	resumeRound() {
		if(this.roundExpiration === null) {
			return;
		}

		const difference = Math.max(0, this.roundExpiration.diff());

		this.roundTimeout = setTimeout(() => this.autoAct(this.order[this.current][1]), difference);
	}

	canAct(id, action, value) {
		if(action === 'hover' && this.lastHover !== null && this.lastHover.diff() > -30) {
			return false;
		}

		if(value === null) {
			return false;
		}

		const teamIndex = this.getTeamIndexById(id);

		if(teamIndex === null) {
			return false;
		}

		if(this.current === 0 && action === 'ready' && value === true) {
			return true;
		}

		const currentRound = this.order[this.current];

		if([this.picks, this.bans].flat(Infinity).includes(value) || !this.champions.find(champion => champion.id === value)) {
			return false;
		}

		if(action === 'hover' && this.hover[teamIndex] === value) {
			return false;
		}

		return currentRound[0] === teamIndex && ['hover', currentRound[1]].includes(action);
	}

	act(id, action, value, bypass = false) {
		if(!bypass && !this.canAct(id, action, value)) {
			return;
		}

		const teamIndex = this.getTeamIndexById(id);

		switch(action) {
			case 'ban':
			case 'pick':
				this[action + 's'][teamIndex].push(value);
				this.hover[teamIndex] = null;
				this.lastHover = null;
				++this.current;

				if(this.order[this.current][1] === 'done') {
					this.endRound();
				} else {
					this.startRound();
				}

				break;

			case 'hover':
				this.lastHover = dayjs();
			// noinspection FallThroughInSwitchStatementJS
			case 'ready':
				this[action][teamIndex] = value;

				if(action === 'ready' && !this.ready.includes(false)) {
					this.startRound();
				}

				break;
		}

		this.onStateChange(this);
	}

	autoAct(action) {
		const teamIndex = this.order[this.current][0];

		let value = null;
		if(this.hover[teamIndex] !== null) {
			value = this.hover[teamIndex];
		} else if(action === 'pick') {
			value = this.champions.filter(champion => ![this.picks, this.bans].flat(Infinity).includes(champion.id)).sort(() => Math.random() < 0.5 ? 1 : -1)[0].id;
		}

		this.act(this.teams[teamIndex].getId(), action, value, true);
	}
};
