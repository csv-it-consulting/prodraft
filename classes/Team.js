const crypto = require('crypto');

module.exports = class Team {
	id = null;
	name = null;

	constructor(name) {
		this.generateId();

		this.name = name;
	}

	generateId() {
		this.id = crypto.randomUUID();
	}

	getId() {
		return this.id;
	}
};
