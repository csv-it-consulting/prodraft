const nanoid = require('nanoid');
const dictionary = require('nanoid-dictionary');
const generate = nanoid.customAlphabet(dictionary.alphanumeric, 10);

module.exports = class Id {
	static generate() {
		return generate();
	}
};
