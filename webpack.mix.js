const mix = require('laravel-mix');

require('laravel-mix-polyfill');

mix.js('src/app.js', 'assets')
	.vue()
	.sass('src/style.scss', 'assets')
	.setPublicPath('public')
	.version()
	.polyfill({
		enabled: true,
		targets: '>0%',
	});
