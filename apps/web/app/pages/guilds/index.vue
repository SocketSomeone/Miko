<template>
	<v-container class="mb-5">
		<h1 class="text-center headline">SELECT DISCORD SERVER</h1>

		<v-row align="center" justify="center">
			<ServerCard v-for="n in 10" :key="n" />
		</v-row>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "My servers",
	head: {
		title: "My servers"
	}
})
export default class extends Vue {}
</script>

<style lang="scss" scoped>
h1 {
	margin-bottom: 40px;
}
</style>
