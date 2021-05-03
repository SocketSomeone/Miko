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
import Debug from "../components/mixins/Debug";

@Component({
	name: "DefaultLayout",
	mixins: [Debug]
})
export default class extends Vue {}
</script>
