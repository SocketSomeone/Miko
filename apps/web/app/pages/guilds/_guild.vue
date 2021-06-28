<template >
	<v-container>
		<v-row align="center">
			<NavigationSidebar>
				<v-list-item-group class="mt-3">
					<v-row d-flex align="center" class="primary--text title">
						<v-avatar size="32" color="primary" class="mr-2"> </v-avatar>

						Miko Support
					</v-row>
				</v-list-item-group>

				<v-divider class="my-3" />

				<v-list-item-group mandatory class="modules">
					<!-- <v-list-item v-for="(item, i) in nav" :key="i" class="mb-2" dense>
						<v-list-item-icon class="mr-3">
							<v-icon dense v-text="item.icon"></v-icon>
						</v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title v-text="item.text"></v-list-item-title>
						</v-list-item-content>
					</v-list-item> -->
				</v-list-item-group>
			</NavigationSidebar>
		</v-row>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Server",
	head: {
		title: "Server"
	}
})
export default class extends Vue {}
</script>

<style lang="scss">
</style>
