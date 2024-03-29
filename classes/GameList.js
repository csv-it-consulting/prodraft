const fs = require('fs');
const dayjs = require('dayjs');
const { Client } = require('pg');
const Game = require('./Game');

module.exports = class GameList {
	static games = {};
	static client = null;

	static init(champions, onStateChange) {
		const config = process.env.PGCA ? [{
			ssl: {
				ca: process.env.PGCA,
			},
		}] : [];

		this.client = new Client(...config);

		return this.client.connect()
			.then(() => this.client.query(fs.readFileSync('init.sql').toString()))
			.then(() => this.client.query('select id, state from public.games'))
			.then(res => {
				for(let gameData of res.rows) {
					this.games[gameData.id] = Game.unserialize(gameData.id, gameData.state, champions, onStateChange);
				}
			});
	}

	static async update(id) {
		const game = this.games[id];

		await this.client.query('update public.games set state = $1 where id = $2', [game.serialize(), game.getId()]);
	}

	static async insert(id) {
		const game = this.games[id];

		await this.client.query('insert into public.games (id, state) values ($1, $2)', [game.getId(), game.serialize()]);
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

			await this.client.query(`delete from public.games where id in(${placeholders})`, expiredIds);
		}

		return expiredIds;
	}
};
