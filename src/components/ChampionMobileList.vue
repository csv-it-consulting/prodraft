<template>
	<div>
		<div class="d-flex flex-row justify-content-between mb-2">
			<template v-for="index in 3">
				<div class="bg-secondary" v-if="index <= display.length && display[index - 1].data !== null">
					<champion-icon class="d-flex justify-content-center card-img rounded-0" :class="{ 'champion-banned': type === 'ban' && !display[index - 1].hovered, 'champion-active': index - 1 === activeIndex }" :champion="display[index - 1].data" :size="size"></champion-icon>
				</div>
				<div v-else class="bg-secondary" :style="`width: ${size}px; height: ${size}px;`">
					<div class="h-100 w-100" :class="{ 'champion-banned': type === 'ban' && display[index - 1] && !display[index - 1].hovered, 'champion-active': index - 1 === activeIndex }"></div>
				</div>
			</template>
		</div>
		<div class="d-flex flex-row justify-content-around">
			<template v-for="index in 2">
				<div class="bg-secondary" v-if="(index + 3) <= display.length && display[index + 2].data !== null">
					<champion-icon class="d-flex justify-content-center card-img rounded-0" :class="{ 'champion-banned': type === 'ban' && !display[index - 1].hovered, 'champion-active': index + 2 === activeIndex }" :champion="display[index + 2].data" :size="size"></champion-icon>
				</div>
				<div v-else class="bg-secondary" :style="`width: ${size}px; height: ${size}px;`">
					<div class="h-100 w-100" :class="{ 'champion-banned': type === 'ban' && display[index + 2] && !display[index + 2].hovered, 'champion-active': index + 2 === activeIndex }"></div>
				</div>
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
			const selectedChampionsLength = this.selected.length;
			const lastSelectedChampion = this.selected[selectedChampionsLength - 1];
			const isLastChampionHovered = lastSelectedChampion && lastSelectedChampion.hovered;

			return this.active ? isLastChampionHovered ? selectedChampionsLength - 1 : selectedChampionsLength : null;
		},

		display() {
			const champions = this.selected.map(id => ({
				data: id === null ? null : this.champions.find(champion => champion.id === id),
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
			size: 48,
		};
	},

	props: {
		active: {
			type: Boolean,
			default: false,
		},

		selected: {
			type: Array,
			required: true,
		},

		champions: {
			type: Array,
			required: true,
		},

		hovered: {
			type: String,
			default: null,
		},

		team: {
			type: Number,
			required: true,
		},

		type: {
			type: String,
			required: true,
		},
	},
};
</script>
