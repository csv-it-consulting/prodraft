<template>
	<div v-if="state !== null && champions !== null" class="d-flex flex-column h-100">
		<div class="row game-header">
			<div class="col-5 bg-info d-flex justify-content-between align-items-baseline">
				<h1 class="d-inline-block text-truncate">{{ state.teams[0].name }}</h1>
				<h5 class="d-inline-block">{{ getTeamAction(0) }}</h5>
			</div>
			<div class="col-2 d-flex justify-content-center" :class="['ready', 'done'].includes(currentAct) ? 'blue-red-gradient' : (currentTeam === 0 ? 'blue-act-gradient' : 'red-act-gradient')">
				<h1>{{ timer }}</h1>
			</div>
			<div class="col-5 bg-danger d-flex justify-content-between align-items-baseline">
				<h5 class="d-inline-block">{{ getTeamAction(1) }}</h5>
				<h1 class="d-inline-block text-truncate">{{ state.teams[1].name }}</h1>
			</div>
		</div>
		<div class="row game-body">
			<champion-pick-list class="col-xl-2 col-sm-3 bg-info p-3" :champions="champions" :picks="state.picks[0]" :hovered="getHovered(0, 'pick')" :active="getActive(0, 'pick')"></champion-pick-list>
			<div class="col-xl-8 col-sm-6 overflow-hidden h-100">
				<champion-picker ref="championPicker" :champions="champions" :banned-ids="bannedChampionIds" :picked-ids="pickedChampionIds" :disabled="team === null || ['ready', 'done'].includes(currentAct)" v-model="input.champion"></champion-picker>
			</div>
			<champion-pick-list class="col-xl-2 col-sm-3 bg-danger p-3" :champions="champions" :picks="state.picks[1]" :hovered="getHovered(1, 'pick')" :active="getActive(1, 'pick')"></champion-pick-list>
		</div>
		<div class="row game-footer">
			<div class="col-5 bg-info d-flex justify-content-end">
				<champion-ban-list :champions="champions" :bans="state.bans[0]" :team="0" :hovered="getHovered(0, 'ban')" :active="getActive(0, 'ban')"></champion-ban-list>
			</div>
			<div class="col-2">
				<div class="py-3 h-100">
					<button type="button" class="rounded-0 btn w-100 h-100" :class="['ready', 'done'].includes(currentAct) ? 'btn-secondary' : (currentTeam === 0 ? 'btn-info' : 'btn-danger')" :disabled="!canAct" @click="lock">{{ actButtonText }}</button>
				</div>
			</div>
			<div class="col-5 bg-danger d-flex justify-content-start">
				<champion-ban-list :champions="champions" :bans="state.bans[1]" :team="1" :hovered="getHovered(1, 'ban')" :active="getActive(1, 'ban')"></champion-ban-list>
			</div>
		</div>
	</div>
</template>
<script>
import io from 'socket.io-client';
import qs from 'qs';
import dayjs from 'dayjs';
import ChampionBanList from './ChampionBanList';
import ChampionPickList from './ChampionPickList';
import ChampionPicker from './ChampionPicker';

export default {
	components: { ChampionBanList, ChampionPickList, ChampionPicker },

	computed: {
		actButtonText() {
			return this.currentAct[0].toUpperCase() + this.currentAct.slice(1);
		},

		bannedChampionIds() {
			return this.state.bans.flat(Infinity);
		},

		canAct() {
			return (this.state.current === 0 && this.state.ready[this.team] === false) || (!this.state.ready.includes(false) && this.currentTeam === this.team && this.currentTeam !== null && this.input.champion !== null);
		},

		currentAct() {
			return this.state.current === 0 && (!this.state.ready[0] || !this.state.ready[1]) ? 'ready' : this.state.order[this.state.current][1];
		},

		currentTeam() {
			return this.state.order[this.state.current][0];
		},

		pickedChampionIds() {
			return this.state.picks.flat(Infinity);
		},
	},

	data() {
		return {
			champions: null,
			state: null,
			team: null,

			socket: null,

			gameId: null,
			teamId: null,

			input: {
				champion: null,
			},

			timer: null,
			timerFrame: null,
		};
	},

	methods: {
		connect() {
			const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });

			this.gameId = query.game;
			this.teamId = query.team || null;
			this.socket = io({ transports: ['websocket', 'polling'], query: { game: this.gameId, team: this.teamId } });

			this.socket.on('game-state', state => {
				this.state = state;

				if(this.state.hover[this.team] !== null) {
					this.input.champion = this.champions.find(champion => champion.id === this.state.hover[this.team]);
				}

				if(this.state.order[this.state.current][0] === this.team && this.input.champion) {
					this.hover(this.input.champion);
				}

				if(this.state.roundExpiration) {
					this.startTimer();
				} else {
					this.endTimer();
				}
			});
			this.socket.on('champions', champions => this.champions = champions);
			this.socket.on('assign-team', team => this.team = team);
			this.socket.on('game-expired', () => {
				alert('This draft has expired. Please create a new draft.');

				window.location.href = '/';
			});
		},

		getActive(team, act) {
			return this.currentTeam === team && this.currentAct === act;
		},

		getHovered(team, act) {
			if(this.currentTeam !== team || this.currentAct !== act) {
				return null;
			}

			return this.state.hover[this.currentTeam];
		},

		getTeamAction(team) {
			if(this.state.current === 0) {
				if(!this.state.ready[team]) {
					return 'Not Ready';
				} else if(!this.state.ready[team ^ 1]) {
					return 'Ready';
				}
			}

			if(this.currentTeam !== team) {
				return '';
			}

			return this.currentAct === 'ban' ? 'Banning' : 'Picking';
		},

		endTimer() {
			cancelAnimationFrame(this.timerFrame);
			this.timerFrame = null;
			this.timer = null;
		},

		hover(champion) {
			this.socket.emit('game-action', { action: 'hover', value: champion?.id });
		},

		lock() {
			if(['ban', 'pick'].includes(this.currentAct) && this.$refs.championPicker) {
				this.$refs.championPicker.clearFilters();
			}

			this.socket.emit('game-action', { action: this.currentAct, value: this.currentAct === 'ready' ? true : this.input.champion?.id });
		},

		startTimer() {
			const updateTimer = () => {
				let displaySeconds = Math.floor((this.state.roundExpiration - Number(dayjs())) / 1000) - 3;

				if(displaySeconds < 0) {
					displaySeconds = '0' + '!'.repeat(Math.min(3, -displaySeconds));
				}

				this.timer = displaySeconds;
				this.timerFrame = requestAnimationFrame(updateTimer);
			};

			this.timerFrame = requestAnimationFrame(updateTimer);
		},
	},

	mounted() {
		this.connect();
	},

	watch: {
		'input.champion': 'hover',
	},
};
</script>
<style scoped>
.game-header {
	height: 65px;
}

.game-body {
	height: calc(100% - 65px - 80px);
}

.game-footer {
	height: 80px;
}
</style>
