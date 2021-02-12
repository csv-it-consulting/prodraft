module.exports = function createServer() {
	const express = require('express');
	const app = express();
	const PORT = 80;

	app.use(express.static('public'));

	app.post('/game');

	app.listen(PORT);
};
