module.exports = class Champion {
	version = null;
	id = null;
	name = null;
	splash = null;
	sprite = null;
	tags = null;

	constructor(version, id, name, splash, sprite, tags) {
		this.version = version;
		this.id = id;
		this.name = name;
		this.splash = splash;
		this.sprite = sprite;
		this.tags = tags;
	}
};
