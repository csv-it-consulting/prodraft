<template>
	<div class="d-flex justify-content-center text-center">
		<div class="card bg-transparent border-0 py-3 px-2">
			<div class="row" :class="team === 0 ? 'flex-row-reverse' : 'flex-row'">
				<template v-for="index in 5">
					<div class="bg-secondary mx-2" v-if="index <= bannedChampions.length && bannedChampions[index - 1].data !== null">
						<champion-icon class="d-flex justify-content-center card-img rounded-0" :class="{ 'champion-banned': !bannedChampions[index - 1].hovered, 'champion-active': index - 1 === activeIndex }" :champion="bannedChampions[index - 1].data" :size="size"></champion-icon>
					</div>
					<div v-else class="bg-secondary mx-2" :style="`width: ${size}px; height: ${size}px;`">
						<div class="h-100 w-100" :class="{ 'champion-banned': bannedChampions[index - 1] && !bannedChampions[index - 1].hovered, 'champion-active': index - 1 === activeIndex }"></div>
					</div>
					<span v-if="index === 3" class="vertical-separator mx-2"></span>
				</template>
			</div>
		</div>
	</div>
</template>
<script>
import ChampionIcon from './ChampionIcon';

export default {
	components: { ChampionIcon },

	computed: {
		activeIndex() {
			const bannedChampionsLength = this.bannedChampions.length;
			const lastBannedChampion = this.bannedChampions[bannedChampionsLength - 1];
			const isLastChampionHovered = lastBannedChampion && lastBannedChampion.hovered;

			return this.active ? isLastChampionHovered ? bannedChampionsLength - 1 : bannedChampionsLength : null;
		},

		bannedChampions() {
			const champions = this.bans.map(id => ({
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

		bans: {
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
	},
};
</script>
<style scoped>
.vertical-separator {
	border-left: 5px solid #444444;
}
</style>
