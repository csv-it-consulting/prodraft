const ChampionList = require('./classes/ChampionList');
const GameList = require('./classes/GameList');
const Game = require('./classes/Game');
const createServer = require('./create-server');
const dayjs = require('dayjs');

const onGameStateChange = game => {
	io.to(`game.${game.getId()}`).emit('game-state', game.getState());

	GameList.update(game.getId());
};

function validateGameCreation(input) {
	if(!Array.isArray(input.teams) || input.teams.length !== 2 || typeof input.teams[0] !== 'string' || typeof input.teams[1] !== 'string') {
		return false;
	}

	const cleanse = string => string.trim().substr(0, 30);

	return {
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

	const game = new Game(input.teams, ChampionList.get(), onGameStateChange);
	const teams = game.getTeams();

	GameList.add(game.getId(), game);

	res.send({
		game: game.getId(),
		teams: teams.map(team => team.getId()),
	});
}

function onJoinGame(socket) {
	const game = GameList.get(socket.handshake.query.game);

	if(game === undefined) {
		socket.emit('game-expired');
		socket.disconnect(true);

		return;
	}

	socket.emit('champions', ChampionList.get());
	socket.emit('server-time', Number(dayjs()))
	socket.emit('assign-team', game.getTeamIndexById(socket.handshake.query.team));
	socket.emit('game-state', game.getState());
	socket.join(`game.${game.getId()}`);
}

function onGameAction(socket, data) {
	const game = GameList.get(socket.handshake.query.game);

	if(game === undefined) {
		socket.emit('game-expired');
		socket.disconnect(true);

		return;
	}

	game.act(socket.handshake.query.team, data.action, data.value);
}

setInterval(() => ChampionList.update(), 3600000); // 1 hour
ChampionList.update(champions => GameList.init(champions, onGameStateChange));

setInterval(async () => {
	const expired = await GameList.flushExpired();

	for(let id of expired) {
		io.to(`game.${id}`).emit('game-expired');
	}
}, 3600000); // 1 hour

const io = createServer(createGame, onJoinGame, onGameAction);
