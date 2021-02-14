const uuid = require('uuid');

module.exports = class Team {
	id = uuid.v4();
	name = null;

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
