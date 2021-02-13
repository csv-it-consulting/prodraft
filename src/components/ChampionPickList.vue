<template>
	<div class="d-flex justify-content-center text-center">
		<div class="card bg-transparent border-0">
			<template v-for="index in 5">
				<template v-if="index <= picks.length">
					<champion-icon class="card-img rounded-0 bg-white" :champion="picks[index - 1]" :size="100"></champion-icon>
					<p class="card-text">{{ picks[index - 1].name }}</p>
				</template>
				<template v-else>
					<div class="bg-secondary" style="width: 100px; height: 100px;"></div>
					<p class="card-text">&nbsp;</p>
				</template>
				<span v-if="index === 3" style="border-bottom: 5px solid #444444" class="mb-3"></span>
			</template>
		</div>
	</div>
</template>
<script>
import ChampionIcon from './ChampionIcon';

export default {
	components: { ChampionIcon },

	props: {
		picks: {
			type: Array,
			required: true,
		},
	},
};
</script>
