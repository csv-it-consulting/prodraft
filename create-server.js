module.exports = function createServer(createGame, onJoinGame, onGameAction) {
	const express = require('express');
	const app = express();
	const compression = require('compression');
	const bodyParser = require('body-parser');
	const server = require('http').createServer(app);
	const io = require('socket.io')(server);
	const Sentry = require('@sentry/node');
	const SentryTracing = require('@sentry/tracing');
	const fs = require('fs');
	const path = require('path');
	const PORT = 80;

	Sentry.init({
		dsn: process.env.SENTRY_DSN_BACKEND,
		integrations: [
			new Sentry.Integrations.Http({ tracing: true }),
			new SentryTracing.Integrations.Express({ app }),
		],
		release: process.env.COMMIT_HASH,
	});
	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());

	app.use(compression());

	const mixManifest = require(path.join(__dirname, 'public', 'mix-manifest.json'));

	app.get('/', (req, res) => {
		fs.readFile(path.join(__dirname, 'public', 'index.html'), (error, data) => {
			if(error) {
				res.sendStatus(500);

				throw error;
			} else {
				res.send(data.toString().replace(/ASSET\[([^]+?)\]/g, ($0, $1) => mixManifest[$1]));
			}
		});
	});

	app.use(express.static('public', { index: false, maxAge: '1y' }));
	app.use(bodyParser.json());

	app.post('/game', createGame);
	io.on('connection', function (socket) {
		onJoinGame(socket);

		socket.on('game-action', function (data) {
			onGameAction(socket, data);
		});
	});

	server.listen(PORT);

	app.use(Sentry.Handlers.errorHandler());

	return io;
};
