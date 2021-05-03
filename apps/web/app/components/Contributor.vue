<template>
	<v-slide-item>
		<v-card
			class="contributor-card ma-4 pa-5"
			height="220"
			width="160"
			elevation="6"
			color="background"
		>
			<v-avatar
				color="accent"
				max-width="98px"
				max-height="98px"
				size="98px"
				rounded="circle"
			>
				S
			</v-avatar>

			<h4 class="primary--text font-weight-medium pt-2">Name</h4>

			<p class="font-weight-regular caption">Specialization</p>

			<v-row justify="space-around" align="center" class="pt-1">
				<v-btn icon link><v-icon size="20">mdi-discord</v-icon></v-btn>
				<v-btn icon link><v-icon size="20">mdi-vk</v-icon></v-btn>
				<v-btn icon link><v-icon size="20">mdi-email</v-icon></v-btn>
			</v-row>
		</v-card>
	</v-slide-item>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Contributor"
})
export default class extends Vue {}
</script>
