<template>
	<div class="h-100 pt-3">
		<div class="row px-3 picker-toolbar">
			<div class="col-12">
				<div class="input-group h-100">
					<div class="input-group-prepend" v-if="!mobile">
						<button type="button" class="btn btn-secondary" :class="{ active: input.tag === null }" @click="filterTag(null)">All</button>
						<button type="button" class="btn btn-secondary" v-for="tag in allTags" :class="{ active: input.tag === tag }" @click="filterTag(tag)">{{ tag }}</button>
					</div>
					<input type="text" class="form-control h-100" placeholder="Search..." v-model="input.search">
				</div>
			</div>
		</div>
		<div class="row mt-3 picker-list">
			<div class="col-12 d-flex flex-wrap justify-content-center align-content-start h-100 overflow-auto px-3 pb-3">
				<div v-for="champion in filteredChampions" class="m-2 d-flex">
					<champion-icon :champion="champion" :size="48" class="d-flex justify-content-center champion-icon" :class="{ 'champion-picked': pickedIds.includes(champion.id), 'champion-banned': bannedIds.includes(champion.id), 'champion-selected': valueProxy !== null && champion.id === valueProxy.id }" @click.native="select(champion)"></champion-icon>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import ChampionIcon from './ChampionIcon';
import escapeStringRegexp from 'escape-string-regexp';

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
			const search = this.input.search.trim();
			const searches = search.split(/\|+/g);

			// noinspection SpellCheckingInspection
			const overrides = {
				clock: 'zilean',
				rat: 'twitch',
				rock: 'malphite'
			};

			for(let override in overrides) {
				if(overrides.hasOwnProperty(override) && search.includes(override)) {
					searches.push(overrides[override]);
				}
			}

			const searchRegexp = new RegExp(searches.map(escapeStringRegexp).join('|').split('').map(c => c === '\\' ? c : `${c}.*`).join(''), 'i');
			const tag = this.input.tag;

			return this.champions.filter(champion => {
				if(search !== '' && !champion.name.match(searchRegexp)) {
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
		clearFilters() {
			this.input.search = '';
			this.input.tag = null;
		},

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

		mobile: {
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
		value() {
			this.clearInvalidValue();

			if(this.value !== this.valueProxy) {
				this.valueProxy = this.value;
			}
		},
		valueProxy: 'clearInvalidValue',
	},
};
</script>
<style scoped>
.picker-toolbar {
	height: 38px;
}

.picker-list {
	height: calc(100% - 1rem - 38px);
}

.champion-icon {
	cursor: pointer;
}

.champion-selected {
	outline: 5px solid #f39c12;
}

.champion-picked {
	filter: grayscale(1);
}
</style>
