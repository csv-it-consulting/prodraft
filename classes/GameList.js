const fs = require('fs');
const dayjs = require('dayjs');
const { Client } = require('pg');
const Game = require('./Game');

module.exports = class GameList {
	static games = {};
	static client = null;

	static async init(champions, onStateChange) {
		this.client = new Client;
		await this.client.connect();

		await this.client.query(fs.readFileSync('init.sql').toString());

		const res = await this.client.query('select uuid, state from prodraft.games');

		for(let gameData of res.rows) {
			this.games[gameData.uuid] = Game.unserialize(gameData.uuid, gameData.state, champions, onStateChange);
		}
	}

	static async update(id) {
		const game = this.games[id];

		await this.client.query('update prodraft.games set state = $1 where uuid = $2', [game.serialize(), game.getId()]);
	}

	static async insert(id) {
		const game = this.games[id];

		await this.client.query('insert into prodraft.games (uuid, state) values ($1, $2)', [game.getId(), game.serialize()]);
	}

	static add(id, game) {
		this.games[id] = game;

		this.insert(id);
	}

	static get(id) {
		return this.games[id];
	}

	static async flushExpired() {
		const now = dayjs();
		const expiredIds = [];

		for(let id in this.games) {
			if(this.games.hasOwnProperty(id) && now.isAfter(this.games[id].getExpiration())) {
				delete this.games[id];

				expiredIds.push(id);
			}
		}

		if(expiredIds.length > 0) {
			const placeholders = expiredIds.map((id, index) => `\$${index + 1}`).join(',');

			await this.client.query(`delete from prodraft.games where uuid in(${placeholders})`, expiredIds);
		}

		return expiredIds;
	}
};
