const Id = require('./Id');

module.exports = class Team {
	id = Id.generate();
	name = null;

	serialize() {
		return {
			id: this.getId(),
			name: this.getName(),
		};
	}

	static unserialize(data) {
		const team = new Team(data.name);
		team.id = data.id;

		return team;
	}

	constructor(name) {
		this.name = name;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}
};
