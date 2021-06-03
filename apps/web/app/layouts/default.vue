<template>
	<v-app>
		<Header />

		<v-main>
			<nuxt />
		</v-main>

		<Footer />
	</v-app>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "DefaultLayout"
})
export default class extends Vue {}
</script>
