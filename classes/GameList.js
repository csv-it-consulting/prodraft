const dayjs = require('dayjs');

module.exports = class GameList {
	static games = {};

	static add(id, game) {
		this.games[id] = game;
	}

	static get(id) {
		return this.games[id];
	}

	static flushExpired() {
		const now = dayjs();
		const expiredIds = [];

		for(let id in this.games) {
			if(this.games.hasOwnProperty(id) && now.isAfter(this.games[id].getExpiration())) {
				delete this.games[id];

				expiredIds.push(id);
			}
		}

		return expiredIds;
	}
};
