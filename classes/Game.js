const dayjs = require('dayjs');
const uuid = require('uuid');

const Team = require('./Team');

module.exports = class Game {
	onStateChange = null;

	id = uuid.v4();
	champions = null;
	teams = null;
	expiration = dayjs().add(24, 'hour');

	roundExpiration = null;

	bans = [[], []];
	picks = [[], []];

	hover = [null, null];
	ready = [false, false];

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

	constructor(teamNames, champions, onStateChange) {
		this.champions = champions;
		this.teams = [
			new Team(teamNames[0]),
			new Team(teamNames[1]),
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

	canAct(id, action, value) {
		if(value === null) {
			return false;
		}

		const teamIndex = this.getTeamIndexById(id);

		if(teamIndex === null) {
			return false;
		}

		if(this.current === 0 && action === 'ready') {
			return true;
		}

		const currentRound = this.order[this.current];

		if([this.picks, this.bans].flat(Infinity).includes(value)) {
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
				++this.current;

				if(this.order[this.current][1] === 'done') {
					this.endRound();
				} else {
					this.startRound();
				}

				break;

			case 'hover':
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
