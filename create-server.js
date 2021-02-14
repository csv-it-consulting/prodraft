module.exports = function createServer(createGame, onJoinGame, onGameAction) {
	const express = require('express');
	const app = express();
	const compression = require('compression');
	const bodyParser = require('body-parser');
	const server = require('http').createServer(app);
	const io = require('socket.io')(server);
	const PORT = 80;

	app.use(compression());
	app.use(express.static('public'));
	app.use(bodyParser.json());

	app.post('/game', createGame);
	io.on('connection', function (socket) {
		onJoinGame(socket);

		socket.on('game-action', function (data) {
			onGameAction(socket, data);
		});
	});

	server.listen(PORT);

	return io;
};
