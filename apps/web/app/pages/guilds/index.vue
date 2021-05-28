<template>
	<v-container class="mb-5" fluid>
		<h1 class="text-center headline">SELECT DISCORD SERVER</h1>

		<v-row align="center" justify="center">
			<GuildCard v-for="(guild, i) in guilds" :key="i" :guild="guild" />
		</v-row>
	</v-container>
</template>

<script lang="ts">
import { Context } from "@nuxt/types";
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Guilds",
	head: {
		title: "Guilds"
	}
})
export default class extends Vue {
	async asyncData({ $axios }: Context) {
		const guilds = await $axios.$get("/guilds");

		return { guilds };
	}
}
</script>

<style lang="scss" scoped>
h1 {
	margin-bottom: 40px;
}
</style>
