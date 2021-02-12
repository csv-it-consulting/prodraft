module.exports = function createServer(createGame, attemptAct) {
	const express = require('express');
	const app = express();
	const bodyParser = require('body-parser');
	const http = require('http').Server(app);
	const io = require('socket.io')(http);
	const PORT = 80;

	app.use(express.static('public'));

	app.use(bodyParser.json());

	app.post('/game', createGame);

	io.on('connection', console.log);

	http.listen(PORT);
};
