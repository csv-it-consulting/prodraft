<template>
	<div class="d-flex flex-column h-100">
		<div v-if="state !== null && champions !== null" class="d-flex flex-column h-100">
			<div class="row game-header">
				<div class="col-5 bg-info d-flex justify-content-between align-items-baseline">
					<h1 class="d-inline-block text-truncate">{{ state.teams[0].name }}</h1>
					<h5 class="d-inline-block text-nowrap">{{ getTeamAction(0) }}</h5>
				</div>
				<div class="col-2 d-flex justify-content-center" :class="['ready', 'done'].includes(currentAct) ? 'blue-red-gradient' : (currentTeam === 0 ? 'blue-act-gradient' : 'red-act-gradient')">
					<h1>{{ timer }}</h1>
				</div>
				<div class="col-5 bg-danger d-flex justify-content-between align-items-baseline">
					<h5 class="d-inline-block text-nowrap">{{ getTeamAction(1) }}</h5>
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
				<div class="col-5 bg-info d-flex justify-content-between">
					<div class="d-flex flex-column justify-content-center">
						<div class="d-flex justify-content-center mb-1">
							<div class="custom-control custom-checkbox">
								<input type="checkbox" class="custom-control-input" id="audio-checkbox" v-model="audio.isEnabled">
								<label class="custom-control-label" for="audio-checkbox">Audio</label>
							</div>
						</div>

						<input type="range" class="form-control-range w-100" v-model.number="audio.volume" min="0.01" max="1" step="0.01">
					</div>

					<champion-ban-list :champions="champions" :bans="state.bans[0]" :team="0" :hovered="getHovered(0, 'ban')" :active="getActive(0, 'ban')" class="flex-shrink-0 ml-3"></champion-ban-list>
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
	</div>
</template>
<script>
import io from 'socket.io-client';
import qs from 'qs';
import dayjs from 'dayjs';
import { Howl, Howler } from 'howler';
import ChampionBanList from './ChampionBanList';
import ChampionPickList from './ChampionPickList';
import ChampionPicker from './ChampionPicker';

Howler.autoSuspend = false;

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
			return this.state === null ? null : (this.state.current === 0 && (!this.state.ready[0] || !this.state.ready[1]) ? 'ready' : this.state.order[this.state.current][1]);
		},

		currentTeam() {
			return this.state.order[this.state.current][0];
		},

		pickedChampionIds() {
			return this.state.picks.flat(Infinity);
		},
	},

	data() {
		const savedAudio = window.localStorage.getItem('audio');
		const savedAudioVolume = window.localStorage.getItem('audio-volume');

		return {
			champions: null,
			state: null,
			team: null,

			socket: null,

			gameId: null,
			teamId: null,

			audio: {
				isEnabled: ['true', true, null].includes(savedAudio),
				isSetup: false,

				volume: savedAudioVolume === null ? 0.5 : Number(savedAudioVolume),

				sounds: ['ban', 'pick', 'lock', 'tick'],
				howls: {},

				lastTickSeconds: null,
			},

			input: {
				champion: null,
			},

			timerOffset: null,
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

				if(this.state.order[this.state.current][0] === this.team && this.input.champion && this.state.hover[this.team] !== this.input.champion?.id) {
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
			this.socket.on('server-time', time => this.timerOffset = Number(dayjs()) - time);
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
			if(champion !== null && champion !== undefined) {
				this.socket.emit('game-action', { action: 'hover', value: champion.id });
			}
		},

		lock() {
			if(['ban', 'pick'].includes(this.currentAct)) {
				this.playAudio('lock');

				if(this.$refs.championPicker) {
					this.$refs.championPicker.clearFilters();
				}
			}

			this.socket.emit('game-action', { action: this.currentAct, value: this.currentAct === 'ready' ? true : this.input.champion?.id });
		},

		playAudio(sound) {
			if(this.audio.isEnabled) {
				this.audio.howls[sound].play();
			}
		},

		setAudioVolume() {
			Howler.volume(this.audio.volume);

			window.localStorage.setItem('audio-volume', this.audio.volume);
		},

		setupAudio() {
			if(this.audio.isEnabled && !this.audio.isSetup) {
				for(let sound of this.audio.sounds) {
					this.audio.howls[sound] = new Howl({
						src: `/assets/audio/${sound}.ogg`,
						preload: true,
					});
				}

				this.audio.isSetup = true;
			}
		},

		startTimer() {
			const updateTimer = () => {
				let displaySeconds = Math.floor((this.state.roundExpiration - Number(dayjs()) + this.timerOffset) / 1000) - 3;

				if(displaySeconds <= 10 && this.currentTeam === this.team && ![displaySeconds, null].includes(this.audio.lastTickSeconds)) {
					this.playAudio('tick');
				}

				this.lastTickSeconds = displaySeconds;

				if(displaySeconds < 0) {
					displaySeconds = '0' + '!'.repeat(Math.min(3, -displaySeconds));
				}

				if(this.timerFrame !== null) {
					this.timer = displaySeconds;
					this.timerFrame = requestAnimationFrame(updateTimer);
				}
			};

			this.timerFrame = requestAnimationFrame(updateTimer);
		},
	},

	mounted() {
		this.connect();

		this.setupAudio();
	},

	watch: {
		'audio.isEnabled'(value) {
			window.localStorage.setItem('audio', value);

			this.setupAudio();
		},

		'audio.volume': {
			immediate: true,
			handler: 'setAudioVolume',
		},

		currentAct(value, oldValue) {
			if(oldValue === 'ready' && ['ban', 'pick'].includes(value) && this.currentTeam === this.team) {
				this.playAudio(value);
			}
		},

		'input.champion': 'hover',

		'state.current'(value, oldValue) {
			if(oldValue !== undefined && this.currentTeam === this.team) {
				if(['ban', 'pick'].includes(this.currentAct)) {
					this.playAudio(this.currentAct);
				}
			}
		},
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
