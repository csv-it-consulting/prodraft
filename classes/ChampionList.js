const Champion = require('./Champion');
const fetch = require('node-fetch');

module.exports = class ChampionList {
	static champions = [];

	static update() {
		fetch('https://ddragon.leagueoflegends.com/api/versions.json')
			.then(res => res.json())
			.then(versions => fetch(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`))
			.then(res => res.json())
			.then(champions => this.champions = Object.keys(champions.data).map(key => {
				const champion = champions.data[key];
				const sprite = {
					src: champion.image.sprite,
					x: champion.image.x,
					y: champion.image.y,
					width: champion.image.w,
					height: champion.image.h,
				};

				return new Champion(champion.id, champion.name, champion.splash, sprite);
			}));
	}

	static get() {
		return this.champions;
	}
};
