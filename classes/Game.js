const crypto = require('crypto');

const Team = require('./Team');

module.exports = class Game {
	id = crypto.randomUUID();
	name = null;
	teams = null;

	bans = [[], []];
	picks = [[], []];

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

	constructor(name, teamNames) {
		this.name = name;
		this.teams = [
			new Team(teamNames[0]),
			new Team(teamNames[1]),
		];
	}

	getId() {
		return this.id;
	}

	getState() {
		return {
			id: this.id,
			name: this.name,

			ready: this.ready,
			bans: this.bans,
			picks: this.picks,

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

	canAct(id, action) {
		const teamIndex = this.getTeamIndexById(id);

		if(teamIndex === null) {
			return false;
		}

		if(this.current === 0 && action === 'ready') {
			return true;
		}

		const currentRound = this.order[this.current];

		return currentRound[0] === teamIndex && currentRound[1] === action;
	}

	act(id, action, championId) {
		if(!this.canAct(id, action)) {
			return false;
		}

		const teamIndex = this.getTeamIndexById(id);

		if(action === 'ban') {
			this.bans[teamIndex].push(championId);

			++this.current;
		} else if(action === 'pick') {
			this.picks[teamIndex].push(championId);

			++this.current;
		} else if(action === 'ready') {
			this.ready[teamIndex] = true;
		}

		return true;
	}
};
