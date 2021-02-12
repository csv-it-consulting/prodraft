const crypto = require('crypto');

module.exports = class Team {
	id = crypto.randomUUID();
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
