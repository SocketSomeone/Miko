<template>
	<v-layout d-block>
		<v-container class="pt-2 justify-center align-center">
			<div class="hero-container">
				<img data-not-lazy class="miko px-1" src="~/assets/images/logo.svg" />

				<p class="hero-text pt-2 px-1">
					<strong><span class="text-highlight">Miko</span></strong
					>&nbsp;{{ $t("home.introduction.paragraph") }}
				</p>

				<div class="group-btns flex-column flex-sm-row mb-5">
					<v-btn large color="primary">
						<v-icon size="18" class="mr-3">mdi-discord</v-icon>
						{{ $t("home.introduction.button.invite") }}
					</v-btn>

					<v-btn large outlined color="primary">
						<v-icon size="18" class="mr-3">mdi-link-variant</v-icon>
						{{ $t("home.introduction.button.support") }}
					</v-btn>
				</div>
			</div>
		</v-container>

		<div class="features mt-5">
			<WaveDivider />

			<v-container class="flex-column">
				<h1 class="section-header" v-text="$t('home.features.heading')"></h1>

				<hr class="section-divider" />

				<v-row class="my-3" justify="center" align="center">
					<Feature
						v-for="(feature, i) in features"
						:key="i"
						:feature="feature"
					/>
				</v-row>

				<hr class="section-divider" />
			</v-container>

			<v-row class="ready-container flex-column">
				<img class="stars mx-auto" src="~/assets/images/stars.svg" />

				<h2 class="section-header" v-text="$t('home.start.heading')"></h2>

				<v-btn color="primary" rounded large>
					<v-icon size="18" class="mr-3">mdi-discord</v-icon>
					{{ $t("home.start.button.invite") }}
				</v-btn>
			</v-row>

			<WaveDivider bottom />
		</div>
	</v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Home",
	auth: false,
	head: {
		title: "Home"
	}
})
export default class extends Vue {
	public features = [
		{
			icon: "shield-star-outline",
			name: "moderation"
		},
		{
			icon: "mushroom-outline",
			name: "game"
		},

		{
			icon: "bell-outline",
			name: "notifications"
		},
		{
			icon: "emoticon-happy-outline",
			name: "actions"
		},
		{
			icon: "clock-fast",
			name: "privates"
		},
		{
			icon: "license",
			name: "ranking"
		}
	];
}
</script>

<style lang="scss" scoped>
.hero-container {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	margin: 0 auto;
	position: relative;
	width: fit-content;

	.hero-text {
		font-size: 19px;
		line-height: 24px;
		font-weight: 400;
		text-align: center;

		display: inline-block;
		position: relative;
		max-width: 480px;

		@media only screen and (max-width: 599px) {
			font-size: 16px;
		}
	}
}

.features {
	background: var(--v-body-base);
	overflow: hidden;

	.ready-container {
		margin: 90px auto 120px;
		width: fit-content;
		position: relative;

		.section-header {
			margin-bottom: 15px !important;
		}

		.v-btn {
			width: fit-content;
			margin: 0 auto;
		}
	}
}
</style>
