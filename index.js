const ChampionList = require('./classes/ChampionList');
const createServer = require('./create-server');

setInterval(ChampionList.update, 3600); // Hourly
ChampionList.update();

createServer();
