<template>
	<div class="modal d-block">
		<div class="modal-dialog">
			<form class="modal-content" @submit.prevent="create" v-if="status === 'creating'">
				<div class="modal-header">
					<div class="modal-title">Create a Draft</div>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="blueName">Match Name</label>
						<input type="text" class="form-control" id="name" v-model="input.name">
					</div>
					<div class="form-group">
						<label for="blueName">Blue Team Name</label>
						<input type="text" class="form-control bg-info" id="blueName" v-model="input.teams[0]">
					</div>
					<div class="form-group">
						<label for="blueName">Red Team Name</label>
						<input type="text" class="form-control bg-danger" id="redName" v-model="input.teams[1]">
					</div>
				</div>
				<div class="modal-footer">
					<button type="submit" class="btn btn-primary" :disabled="!canCreate">Create Draft</button>
				</div>
			</form>
			<div class="modal-content" v-else>
				<div class="modal-body" v-if="status === 'loading'">Creating draft...</div>
				<div class="modal-body" v-else-if="status === 'error'">Failed to create draft.</div>
				<div class="modal-body" v-else-if="status === 'complete'">DATA HERE</div>
			</div>
		</div>
	</div>
</template>
<script>
import axios from 'axios';

export default {
	computed: {
		canCreate() {
			return this.input.name && this.input.teams[0] && this.input.teams[1];
		},
	},

	data() {
		return {
			status: 'creating',

			input: {
				name: '',
				teams: ['', ''],
			},
		};
	},

	methods: {
		create() {
			this.status = 'loading';

			axios.post('game', this.input)
				.then(console.log)
				.catch(() => this.status = 'error');
		},
	},
};
</script>
