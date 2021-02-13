<template>
	<div v-if="state !== null && champions !== null" class="d-flex flex-column h-100">
		<div class="row" style="height: 65px;">
			<div class="col-5 bg-info d-flex justify-content-between align-items-baseline">
				<h1 class="d-inline-block">{{ state.teams[0].name }}</h1>
				<h5 class="d-inline-block">{{ getTeamAction(0) }}</h5>
			</div>
			<div class="col-2 d-flex justify-content-center" :class="currentTeam === 0 ? 'bg-info' : 'bg-danger'">
				<h1>{{ timer }}</h1>
			</div>
			<div class="col-5 bg-danger d-flex justify-content-between align-items-baseline">
				<h5 class="d-inline-block">{{ getTeamAction(1) }}</h5>
				<h1 class="d-inline-block">{{ state.teams[1].name }}</h1>
			</div>
		</div>
		<div class="row" style="height: calc(100% - 65px - 80px);">
			<champion-pick-list class="col-xl-2 col-sm-3 bg-info p-3" :picks="state.picks[0]"></champion-pick-list>
			<div class="col-xl-8 col-sm-6 overflow-hidden h-100">
				<champion-picker :champions="champions" :banned-ids="bannedChampionIds" :picked-ids="pickedChampionIds" v-model="input.champion"></champion-picker>
			</div>
			<champion-pick-list class="col-xl-2 col-sm-3 bg-danger p-3" :picks="state.picks[1]"></champion-pick-list>
		</div>
		<div class="row" style="height: 80px;">
			<div class="col-5 bg-info d-flex justify-content-end">
				<champion-ban-list :bans="state.bans[0]" :team="0"></champion-ban-list>
			</div>
			<div class="col-2">
				<div class="py-3 h-100">
					<button type="button" class="rounded-0 btn w-100 h-100" :class="currentTeam === 0 ? 'btn-info' : 'btn-danger'" @click="lock">Lock</button>
				</div>
			</div>
			<div class="col-5 bg-danger d-flex justify-content-start">
				<champion-ban-list :bans="state.bans[1]" :team="1"></champion-ban-list>
			</div>
		</div>
	</div>
</template>
<script>
import io from 'socket.io-client';
import qs from 'qs';
import ChampionBanList from './ChampionBanList';
import ChampionPickList from './ChampionPickList';
import ChampionPicker from './ChampionPicker';

export default {
	components: { ChampionBanList, ChampionPickList, ChampionPicker },

	computed: {
		currentTeam() {
			return this.state.order[this.state.current][0];
		},

		currentAct() {
			return this.state.current === 0 ? 'ready' : this.state.order[this.state.current][1];
		},

		bannedChampionIds() {
			return this.state.bans.flat().map(champion => champion.id);
		},

		pickedChampionIds() {
			return this.state.picks.flat().map(champion => champion.id);
		},

		timer() {
			// TODO: actually time (serverside too!)
			return 33;
		},
	},

	data() {
		return {
			champions: null,
			state: null,

			socket: null,

			gameId: null,
			teamId: null,

			input: {
				champion: null,
			},
		};
	},

	methods: {
		connect() {
			const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });

			this.gameId = query.game;
			this.teamId = query.team || null;
			this.socket = io({ transports: ['websocket', 'polling'], query: { game: this.gameId, team: this.teamId } });

			this.socket.on('game-state', state => this.state = state);
			this.socket.on('champions', champions => this.champions = champions);
		},

		getTeamAction(team) {
			if(this.state.current === 0 && !this.state.ready[team]) {
				return 'Readying';
			}

			if(this.state.current === 0 && !this.state.ready[team ^ 1]) {
				return 'Waiting for opponent';
			}

			if(this.currentTeam !== team) {
				return '';
			}

			return this.currentAct === 'ban' ? 'Banning' : 'Picking';
		},

		lock() {
			this.socket.emit('game-action', { action: this.currentAct, champion: this.input.champion });
		},
	},

	mounted() {
		this.connect();
	},
};
</script>
<style>
</style>
