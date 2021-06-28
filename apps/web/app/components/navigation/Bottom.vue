<template>
	<v-bottom-navigation app>
		<v-tabs
			background-color="body"
			centered
			fixed-tabs
			hide-slider
			height="100%"
			show-arrows
		>
			<v-tab to="/">
				<v-icon>mdi-home</v-icon>
			</v-tab>

			<v-tab to="/commands">
				<v-icon>mdi-console-line</v-icon>
			</v-tab>

			<v-tab :href="$config.inviteUrl">
				<v-icon>mdi-plus</v-icon>
			</v-tab>

			<v-tab :href="$config.supportUrl">
				<v-icon>mdi-account-group</v-icon>
			</v-tab>

			<v-tab to="/contributors">
				<v-icon>mdi-handshake</v-icon>
			</v-tab>

			<!-- 
			<v-tab to="/status">
				<v-icon>mdi-bug</v-icon>
			</v-tab>

			<v-tab to="/premium">
				<v-icon>mdi-fire</v-icon>
			</v-tab> -->
		</v-tabs>
	</v-bottom-navigation>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "NavBottom"
})
export default class extends Vue {}
</script>
