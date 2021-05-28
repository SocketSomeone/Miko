<template>
	<div class="header-container">
		<v-app-bar color="background" app absolute height="84" flat>
			<nuxt-link class="animated fadeInLeft" to="/">
				<v-toolbar-title  class="primary--text nav-logo"> Miko </v-toolbar-title>
			</nuxt-link>

			<v-spacer />

			<ul class="header-nav hidden-sm-and-down">
				<SafeLink
					:class="`animated fadeInDown ${i === 0 ? '' : `wait-p${i}s`}`"
					v-for="(link, i) of links"
					v-text="$t(link.string)"
					:key="i"
					:link="link.route"
				/>
			</ul>

			<v-spacer class="hidden-sm-and-down" />

			<NavMenu />
		</v-app-bar>

		<NavBottom class="hidden-md-and-up" />
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Header"
})
export default class extends Vue {
	links = [
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
			route: this.$config.inviteUrl,
			string: "header.invite"
		},
		{
			route: this.$config.supportUrl,
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

.header-nav {
	font-size: 15px;
	font-weight: bold;
	text-transform: uppercase;

	display: flex;
	align-items: center;
	justify-content: center;

	list-style-type: none;
	padding: 0;

	a + a {
		margin-left: 30px;
	}

	a {
		transition: 0.25s margin ease-out;

		white-space: nowrap;
		display: inline-block;
		align-items: center;
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

		&.nuxt-link-active::after,
		&:hover::after {
			transform: scaleX(1);
		}
	}
}
</style>
