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
import Debug from "~/components/mixins/Debug";
import CDN from "~/components/mixins/CDN";

@Component({
	name: "DefaultLayout",
	mixins: [Debug, CDN]
})
export default class extends Vue {}
</script>
