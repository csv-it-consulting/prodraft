module.exports = function createServer(createGame, onJoinGame, onGameAction) {
	const express = require('express');
	const app = express();
	const compression = require('compression');
	const bodyParser = require('body-parser');
	const server = require('http').createServer(app);
	const io = require('socket.io')(server);
	const Sentry = require('@sentry/node');
	const SentryTracing = require('@sentry/tracing');
	const PORT = 80;

	Sentry.init({
		dsn: process.env.SENTRY_DSN_BACKEND,
		integrations: [
			new Sentry.Integrations.Http({ tracing: true }),
			new SentryTracing.Integrations.Express({ app }),
		],
	});
	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());

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

	app.use(Sentry.Handlers.errorHandler());

	return io;
};
