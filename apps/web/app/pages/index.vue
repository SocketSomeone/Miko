<template>
	<v-layout class="d-block">
		<v-container
			class="hero-container d-flex justify-center align-center flex-column"
		>
			<img
				data-not-lazy
				class="animated fadeIn miko px-1"
				src="~/assets/images/logo.svg"
			/>

			<p class="animated fadeIn wait-p1s hero-text pt-2 px-1">
				<strong><span class="text-highlight">Miko</span></strong
				>&nbsp;{{ $t("home.introduction.paragraph") }}
			</p>

			<div
				class="animated fadeIn wait-p2s group-btns flex-column flex-sm-row mb-5"
			>
				<v-btn large color="primary" depressed :href="$config.inviteUrl">
					<v-icon size="18" class="mr-3">mdi-discord</v-icon>
					{{ $t("home.introduction.button.invite") }}
				</v-btn>

				<v-btn large outlined color="primary" :href="$config.supportUrl">
					<v-icon size="18" class="mr-3">mdi-link-variant</v-icon>
					{{ $t("home.introduction.button.support") }}
				</v-btn>
			</div>
		</v-container>

		<div class="features mt-5">
			<WaveDivider />

			<v-container class="flex-column animated fadeIn wait-p3s">
				<h1 class="section-header" v-text="$t('home.features.heading')"></h1>

				<hr class="section-divider" />

				<v-row
					class="animated fadeIn wait-p4s my-5"
					justify="center"
					align="center"
					no-gutters
				>
					<Feature
						v-for="(feature, i) in features"
						:key="i"
						:feature="feature"
					/>
				</v-row>
			</v-container>

			<v-row class="ready-container flex-column animated fadeIn wait-p5s">
				<img
					data-not-lazy
					class="stars mx-auto"
					src="~/assets/images/stars.svg"
				/>

				<h2 class="section-header" v-text="$t('home.start.heading')"></h2>

				<v-btn color="primary" large link :href="$config.inviteUrl">
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

	mounted() {
		console.log(123);
	}
}
</script>

<style lang="scss" scoped>
.hero-container {
	padding: 40px 0 20px 0;
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

	.section-header {
		margin: 40px 0;
		margin-bottom: 20px;
		font-weight: 500;
		text-align: center !important;
	}

	.section-divider {
		border: 2px solid #fefefe;
		height: 1px;
		width: 220px;
		border-radius: 360px;

		margin: 20px auto 40px;

		display: flex;
	}

	.ready-container {
		margin: 20px auto 120px;
		width: fit-content;
		position: relative;

		.v-btn {
			width: fit-content;
			margin: 0 auto;
		}
	}
}
</style>
