module.exports = class Champion {
	id = null;
	name = null;
	splash = null;
	sprite = null;

	constructor(id, name, splash, sprite) {
		this.id = id;
		this.name = name;
		this.splash = splash;
		this.sprite = sprite;
	}
};
