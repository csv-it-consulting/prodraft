<template>
	<div class="d-flex justify-content-center text-center">
		<div class="card bg-transparent border-0 align-items-center">
			<template v-for="index in 5">
				<div v-if="index <= pickedChampions.length" class="bg-secondary mb-3">
					<champion-icon class="card-img rounded-0" :class="{ 'champion-active': index - 1 === activeIndex }" :champion="pickedChampions[index - 1].data" :size="size"></champion-icon>
				</div>
				<div v-else class="bg-secondary mb-3" :style="`width: ${size}px; height: ${size}px;`">
					<div class="h-100 w-100" :class="{ 'champion-active': index - 1 === activeIndex }"></div>
				</div>
				<span v-if="index === 3" class="horizontal-separator mb-3 w-100"></span>
			</template>
		</div>
	</div>
</template>
<script>
import ChampionIcon from './ChampionIcon';

export default {
	components: { ChampionIcon },

	computed: {
		activeIndex() {
			const pickedChampionsLength = this.pickedChampions.length;
			const lastPickedChampion = this.pickedChampions[pickedChampionsLength - 1];
			const isLastChampionHovered = lastPickedChampion && lastPickedChampion.hovered;

			return this.active ? isLastChampionHovered ? pickedChampionsLength - 1 : pickedChampionsLength : null;
		},

		pickedChampions() {
			const champions = this.picks.map(id => ({
				data: this.champions.find(champion => champion.id === id),
				hovered: false,
			}));

			if(this.hovered !== null) {
				champions.push({
					data: this.champions.find(champion => champion.id === this.hovered),
					hovered: true,
				});
			}

			return champions;
		},
	},

	data() {
		return {
			size: 100,
		};
	},

	props: {
		active: {
			type: Boolean,
			default: false,
		},

		champions: {
			type: Array,
			required: true,
		},

		hovered: {
			type: String,
			default: null,
		},

		picks: {
			type: Array,
			required: true,
		},
	},
};
</script>
<style scoped>
.horizontal-separator {
	border-bottom: 5px solid #444444;
}
</style>
