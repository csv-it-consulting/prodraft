<template>
	<div class="h-100 pt-3">
		<div class="row px-3" style="height: 38px;">
			<div class="col-12">
				<div class="input-group h-100">
					<div class="input-group-prepend">
						<button type="button" class="btn btn-secondary" :class="{ active: input.tag === null }" @click="filterTag(null)">All</button>
						<button type="button" class="btn btn-secondary" v-for="tag in allTags" :class="{ active: input.tag === tag }" @click="filterTag(tag)">{{ tag }}</button>
					</div>
					<input type="text" class="form-control h-100" v-model="input.search">
				</div>
			</div>
		</div>
		<div class="row mt-3" style="height: calc(100% - 1rem - 38px);">
			<div class="col-12 d-flex flex-wrap justify-content-start align-content-start h-100 overflow-auto px-3 pb-3">
				<div v-for="champion in filteredChampions" class="m-2 d-flex">
					<champion-icon :champion="champion" :size="48" class="d-flex justify-content-center champion-icon" :class="{ 'champion-picked': pickedIds.includes(champion.id), 'champion-banned': bannedIds.includes(champion.id), 'champion-selected': valueProxy !== null && champion.id === valueProxy.id }" @click.native="select(champion)"></champion-icon>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import ChampionIcon from './ChampionIcon';

export default {
	components: { ChampionIcon },

	computed: {
		allTags() {
			return this.champions.reduce((set, champion) => {
				for(let tag of champion.tags) {
					set.add(tag);
				}

				return set;
			}, new Set);
		},

		filteredChampions() {
			const search = this.input.search.toLowerCase();
			const tag = this.input.tag;

			return this.champions.filter(champion => {
				if(search !== '' && !champion.name.toLowerCase().includes(search)) {
					return false;
				}

				if(tag !== null && !champion.tags.includes(tag)) {
					return false;
				}

				return true;
			}).sort((a, b) => a.name > b.name ? 1 : -1);
		},
	},

	data() {
		return {
			input: {
				search: '',
				tag: null,
			},

			valueProxy: this.value || null,
		};
	},

	methods: {
		clearInvalidValue() {
			if(this.valueProxy === null || this.disabled || this.bannedIds.includes(this.valueProxy.id) || this.pickedIds.includes(this.valueProxy.id)) {
				this.select(null);
			}
		},

		filterTag(tag) {
			this.input.tag = tag;
		},

		select(champion) {
			if(champion === null || (!this.disabled && !this.bannedIds.includes(champion.id) && !this.pickedIds.includes(champion.id))) {
				this.valueProxy = champion;
				this.$emit('input', champion);
			}
		},
	},

	props: {
		bannedIds: {
			type: Array,
			required: true,
		},

		champions: {
			type: Array,
			required: true,
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		pickedIds: {
			type: Array,
			required: true,
		},

		value: {
			type: Object,
			default: null,
		},
	},

	watch: {
		disabled: 'clearInvalidValue',
		bannedIds: 'clearInvalidValue',
		pickedIds: 'clearInvalidValue',
		value: 'clearInvalidValue',
		valueProxy: 'clearInvalidValue',
	},
};
</script>
<style scoped>
.champion-icon {
	cursor: pointer;
}

.champion-picked, .champion-banned {
	filter: grayscale(1);
}

.champion-banned::after {
	content: "🚫";
	font-size: 16px;
	opacity: 50%;

	position: absolute;
	right: 0;
	bottom: 0;
}

.champion-selected {
	outline: 5px solid #f39c12;
}
</style>
