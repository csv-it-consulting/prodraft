const ChampionList = require('./classes/ChampionList');
const Game = require('./classes/Game');
const createServer = require('./create-server');

global.games = {};

setInterval(ChampionList.update, 3600); // Hourly
ChampionList.update();

function validateGameCreation(input) {
	if(typeof input.name !== 'string') {
		return false;
	}

	if(!Array.isArray(input.teams) || input.teams.length !== 2 || typeof input.teams[0] !== 'string' || typeof input.teams[1] !== 'string') {
		return false;
	}

	const cleanse = string => string.trim().substr(0, 30);

	return {
		name: cleanse(input.name),
		teams: [
			cleanse(input.teams[0]),
			cleanse(input.teams[1]),
		],
	};
}

function createGame(req, res) {
	const input = validateGameCreation(req.body);

	if(!input) {
		res.end();
	}

	const game = new Game(input.name, input.teams);

	for(let team of game.getTeams()) {
		global.games[team.getId()] = game;
	}

	res.send('test');
}

function attemptAct() {}

createServer(createGame, attemptAct);
