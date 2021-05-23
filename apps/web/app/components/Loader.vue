<template>
	<v-overlay v-if="loading" :value="loading" class="loader">
		<div class="container">
			<v-progress-circular :size="84" indeterminate></v-progress-circular>

			{{ randomLoadingString() }}
		</div>
	</v-overlay>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Loader"
})
export default class extends Vue {
	loading = false;

	start() {
		this.loading = true;
	}

	finish() {
		this.loading = false;
	}

	randomLoadingString() {
		var textArray = ["uWu", "Test", "Parsing your IP"];
		var randomNumber = Math.floor(Math.random() * textArray.length);

		return textArray[randomNumber] + "...";
	}
}
</script>

<style lang="scss">
.loader {
	> .v-overlay__scrim {
		background-color: var(--v-background-base) !important;
		border-color: var(--v-background-base) !important;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		.v-progress-circular {
			color: var(--v-primary-base);
			margin-bottom: 30px;
		}

		font-weight: 400;
		font-size: 22px;
		text-align: center;
	}
}
</style>
