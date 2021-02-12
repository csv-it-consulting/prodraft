const crypto = require('crypto');

const Team = require('./Team');

module.exports = class Game {
	id = crypto.randomUUID();
	name = null;
	teams = null;

	bans = [[], []];
	picks = [[], []];

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

	getName() {
		return this.name;
	}

	getTeams() {
		return this.teams;
	}

	getTeamIndexById(id) {
		for(let team of this.teams) {
			if(team.getId() === id) {
				return team;
			}
		}

		return null;
	}

	getTeamById(id) {
		const index = this.getTeamIndexById(id);

		return index === null ? null : this.teams[index];
	}

	canAct(id, action) {
		const currentRound = this.order[this.current];

		const teamIndex = this.getTeamIndexById(id);
		const team = this.getTeamById(id);

		return team !== null && currentRound[0] === teamIndex && currentRound[1] === action;
	}

	act(id, action, championId) {
		if(!this.canAct(id, action)) {
			return;
		}

		const teamIndex = this.getTeamIndexById(id);

		if(action === 'ban') {
			this.bans[teamIndex].push(championId);
		} else if(action === 'pick') {
			this.picks[teamIndex].push(championId);
		}
	}
};
