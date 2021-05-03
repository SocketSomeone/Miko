<template>
	<v-container>
		<v-app-bar color="background" flat>
			<v-row align="center">
				<nuxt-link to="/">
					<v-toolbar-title class="primary--text nav-logo">
						Miko
					</v-toolbar-title>
				</nuxt-link>

				<div class="nav-links hidden-sm-and-down">
					<SafeLink
						v-for="(category, i) of categories"
						v-text="$t(category.string)"
						:key="i"
						:link="category.route"
					/>
				</div>

				<v-spacer />

				<NavMenu />
			</v-row>
		</v-app-bar>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Header"
})
export default class extends Vue {
	categories = [
		// {
		// 	route: "https://docs.mikoapp.xyz/",
		// 	string: "header.docs"
		// },
		{
			route: "/",
			string: "header.home"
		},
		{
			route: "/commands",
			string: "header.commands"
		},
		{
			route: "https://invite.mikoapp.xyz/",
			string: "header.invite"
		},
		{
			route: "https://discord.mikoapp.xyz/",
			string: "header.support"
		},
		// {
		// 	route: "/status",
		// 	string: "header.status"
		// },
		// {
		// 	route: "/premium",
		// 	string: "header.premium"
		// },
		{
			route: "/contributors",
			string: "header.contributors"
		}
	];
}
</script>

<style lang="scss" scoped>
.nav-logo {
	cursor: pointer;
	text-transform: uppercase;
	font-family: "Discord Font", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
	font-size: 36px !important;
}

.nav-links {
	font-size: 14px;
	font-weight: bold;
	text-transform: uppercase;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);

	display: flex;
	align-items: center;

	a {
		transition: 0.25s margin ease-out;

		white-space: nowrap;
		display: inline-block;
		align-items: center;
		margin: 0 1.3em;
		color: white;

		&:after {
			position: absolute;

			left: 5%;
			bottom: -15px;

			width: 90%;
			border-bottom: 3px solid var(--v-primary-base);
			border-radius: 360px;
			content: "";

			transform: scaleX(0);
			transition: transform 250ms ease-in-out;
		}

		&.nuxt-link-active::after {
			transform: scaleX(1);
		}

		&:hover {
			&:after {
				transform: scaleX(1);
			}
		}
	}
}
</style>
