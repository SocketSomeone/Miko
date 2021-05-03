<template>
	<v-overlay opacity="1" color="background">
		<div class="d-flex flex-column justify-center align-center">
			<v-progress-circular
				:size="64"
				color="primary"
				indeterminate
				class="mb-5"
			></v-progress-circular>

			Logging in...
		</div>
	</v-overlay>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Authorization",
	head: {
		title: "Authorization...",
		titleTemplate: ""
	}
})
export default class extends Vue {}
</script>

