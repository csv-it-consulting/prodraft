const mix = require('laravel-mix');

mix.js('src/app.js', 'assets')
	.vue()
	.sass('src/style.scss', 'assets')
	.setPublicPath('public')
	.version();
