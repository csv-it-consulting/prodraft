module.exports = function createServer(createGame, onJoinGame, onGameAction) {
	const express = require('express');
	const app = express();
	const bodyParser = require('body-parser');
	const http = require('http').Server(app);
	const io = require('socket.io')(http);
	const HTTP_PORT = 80;
	const SOCKET_PORT = 3000;

	app.use(express.static('public'));
	app.use(bodyParser.json());

	app.post('/game', createGame);
	io.on('connection', function (socket) {
		onJoinGame(io, socket);

		socket.on('game-action', function (data) {
			onGameAction(io, socket, data);
		});
	});

	http.listen(HTTP_PORT);
	io.listen(SOCKET_PORT);
};
