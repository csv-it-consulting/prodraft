<template>
	<div class="h-100 w-100" v-if="hasGame">
		<div class="container-xl h-100">
			<game></game>
		</div>
	</div>
	<div class="modal d-block" v-else>
		<div class="modal-dialog">
			<form class="modal-content" @submit.prevent="create" v-if="status === 'creating'">
				<div class="modal-header">
					<div class="modal-title">Create a Draft</div>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="blue-name">Blue Team Name</label>
						<input type="text" class="form-control bg-info text-white" id="blue-name" v-model="input.teams[0]">
					</div>
					<div class="form-group mb-1">
						<label for="red-name">Red Team Name</label>
						<input type="text" class="form-control bg-danger text-white" id="red-name" v-model="input.teams[1]">
					</div>
				</div>
				<div class="modal-footer">
					<button type="submit" class="btn btn-primary" :disabled="!canCreate">Create Draft</button>
				</div>
			</form>
			<div class="modal-content" v-else>
				<div class="modal-body" v-if="status === 'loading'">Creating draft...</div>
				<div class="modal-body" v-else-if="status === 'error'">Failed to create draft.</div>
				<div class="modal-body" v-else-if="status === 'complete'">
					<div class="form-group">
						<label for="spectate-link">Spectate Link</label>
						<div class="input-group">
							<input class="form-control bg-secondary border-0 text-white" :value="links.spectate" readonly id="spectate-link">
							<div class="input-group-append">
								<button type="button" class="btn btn-outline-secondary text-white" data-clipboard-target="#spectate-link">Copy</button>
								<a :href="links.spectate" target="_blank" class="btn btn-outline-secondary text-white">Go</a>
							</div>
						</div>
					</div>
					<div class="form-group">
						<label for="blue-link">{{ input.teams[0] }} Captain Link</label>
						<div class="input-group">
							<input class="form-control bg-info border-0 text-white" :value="links.teams[0]" readonly id="blue-link">
							<div class="input-group-append">
								<button type="button" class="btn btn-outline-info text-white" data-clipboard-target="#blue-link">Copy</button>
								<a :href="links.teams[0]" target="_blank" class="btn btn-outline-info text-white">Go</a>
							</div>
						</div>
					</div>
					<div class="form-group">
						<label for="red-link">{{ input.teams[1] }} Captain Link</label>
						<div class="input-group">
							<input class="form-control bg-danger border-0 text-white" :value="links.teams[1]" readonly id="red-link">
							<div class="input-group-append">
								<button type="button" class="btn btn-outline-danger text-white" data-clipboard-target="#red-link">Copy</button>
								<a :href="links.teams[1]" target="_blank" class="btn btn-outline-danger text-white">Go</a>
							</div>
						</div>
					</div>
					<p>These links will expire in 24 hours.</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import Clipboard from 'clipboard';
import axios from 'axios';
import Game from './Game';

export default {
	components: { Game },

	computed: {
		canCreate() {
			return this.input.teams[0] && this.input.teams[1];
		},
	},

	created() {
		if(window.location.hash.match(/^#?(?<game>[a-zA-Z\d]{10})(?::(?<team>[a-zA-Z\d]{10}))?$/)) {
			this.hasGame = true;
		} else {
			this.status = 'creating';
		}
	},

	data() {
		return {
			hasGame: false,
			status: 'starting',

			links: {
				spectate: null,
				teams: [
					null,
					null,
				],
			},

			input: {
				teams: ['', ''],
			},
		};
	},

	methods: {
		create() {
			this.status = 'loading';

			axios.post('game', this.input)
				.then(response => {
					const game = response.data.game;
					const teams = response.data.teams;

					const spectate = `${window.location.origin}#${game}`;

					this.links.spectate = spectate;
					this.links.teams[0] = `${spectate}:${teams[0]}`;
					this.links.teams[1] = `${spectate}:${teams[1]}`;

					this.status = 'complete';
				})
				.catch(() => this.status = 'error');
		},
	},

	mounted() {
		new Clipboard('[data-clipboard-target]');
	},
};
</script>
