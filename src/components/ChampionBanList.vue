<template>
	<div class="d-flex justify-content-center text-center">
		<div class="card bg-transparent border-0 py-3 px-2">
			<div class="row" :class="team === 0 ? 'flex-row-reverse' : 'flex-row'">
				<template v-for="index in 5">
					<div class="bg-secondary mx-2" v-if="index <= bannedChampions.length && bannedChampions[index - 1].data !== null">
						<champion-icon class="d-flex justify-content-center card-img rounded-0" :class="bannedChampions[index - 1].hovered ? 'champion-hovered' : 'champion-banned'" :champion="bannedChampions[index - 1].data" :size="48"></champion-icon>
					</div>
					<div v-else class="bg-secondary mx-2" :class="{ 'champion-banned': bannedChampions[index - 1] !== undefined && bannedChampions[index - 1].data === null }" style="width: 48px; height: 48px;"></div>
					<span v-if="index === 3" style="border-left: 5px solid #444444" class="mx-2"></span>
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
.champion-banned {
	filter: grayscale(1);
}

.champion-banned::after {
	content: "🚫";
	font-size: 16px;
	opacity: 0.5;

	position: absolute;
	right: 0;
	bottom: 0;
}

@keyframes champion-hovered {
	0%, 100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

.champion-hovered {
	animation: champion-hovered 2s infinite ease-in-out;
}
</style>
