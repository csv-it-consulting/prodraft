const uuid = require('uuid');

module.exports = class Team {
	id = uuid.v4();
	name = null;

	serialize() {
		return {
			id: this.getId(),
			name: this.getName(),
		};
	}

	static unserialize(unserialized) {
		const team = new Team(unserialized.name);
		team.id = unserialized.id;

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
