module.exports = class Team {
	id = null;
	name = null;

	serialize() {
		return {
			id: this.getId(),
			name: this.getName(),
		};
	}

	static unserialize(data) {
		const team = new Team(null, data.name);
		team.id = data.id;

		return team;
	}

	constructor(generateId, name) {
		if(generateId !== null) {
			this.id = generateId();
		}
		this.name = name;
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}
};
