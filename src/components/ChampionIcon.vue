<template>
	<div class="image" :style="style" v-if="type === 'sprite'" :title="champion.name"></div>
	<img class="image" :src="url" :style="style" :title="champion.name" v-else>
</template>
<script>
export default {
	computed: {
		style() {
			const style = {
				height: `${this.size}px`,
				width: `${this.size}px`,
			};

			if(this.type === 'sprite') {
				style['background-image'] = `url(${this.url})`;
				style['background-repeat'] = 'no-repeat';
				style['background-position'] = `-${this.champion.sprite.x}px -${this.champion.sprite.y}px`;
			}

			return style;
		},

		type() {
			return this.size <= 48 ? 'sprite' : 'champion';
		},

		url() {
			return `https://ddragon.leagueoflegends.com/cdn/${this.champion.version}/img/${this.type}/${this.type === 'sprite' ? this.champion.sprite.src : `${this.champion.id}.png`}`;
		},
	},

	props: {
		champion: {
			type: Object,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		},
	},
};
</script>
