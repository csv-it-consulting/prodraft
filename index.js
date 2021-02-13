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
	const teams = game.getTeams();

	global.games[game.getId()] = game;

	res.send({
		game: game.getId(),
		teams: teams.map(team => team.getId()),
	});
}

function onJoinGame(io, socket) {
	const game = global.games[socket.handshake.query.game];

	if(game === undefined) {
		socket.disconnect(true);

		return;
	}

	socket.emit('game-state', game.getState());
	socket.emit('champions', ChampionList.get());
	socket.join(`game.${game.getId()}`);
}

function onGameAction(io, socket, data) {
	const game = global.games[socket.handshake.query.game];

	if(game === undefined) {
		socket.disconnect(true);

		return;
	}

	const success = game.act(socket.handshake.query.team, data.action, data.champion);
	const recipient = success ? io.to(`game.${game.getId()}`) : socket;

	recipient.emit('game-state', game.getState());
}

createServer(createGame, onJoinGame, onGameAction);
