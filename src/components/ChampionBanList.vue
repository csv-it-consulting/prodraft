<template>
	<div class="d-flex justify-content-center text-center">
		<div class="card bg-transparent border-0 py-3 px-2">
			<div class="row" :class="team === 0 ? 'flex-row-reverse' : 'flex-row'">
				<template v-for="index in 5">
					<champion-icon v-if="index <= bans.length" class="card-img rounded-0 bg-white mx-2" :champion="bans[index - 1]" :size="48"></champion-icon>
					<div v-else class="bg-secondary mx-2" style="width: 48px; height: 48px;"></div>
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

	props: {
		bans: {
			type: Array,
			required: true,
		},

		team: {
			type: Number,
			required: true,
		},
	},
};
</script>
