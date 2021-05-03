<template>
	<v-col cols="12" sm="5" md="4" lg="3" xl="2" class="sidebar">
		<v-card color="body" rounded="lg" class="px-4">
			<v-list color="body" flat>
				<slot></slot>
			</v-list>
		</v-card>
	</v-col>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "NavSidebar"
})
export default class extends Vue {}
</script>

<style lang="scss">
.sidebar {
	.v-list-item--link {
		border: var(--v-primary-base) 2px solid !important;
		border-radius: 5px !important;

		background: transparent !important;

		.v-list-item__icon > i,
		.v-list-item__title {
			color: var(--v-primary-base) !important;
			transition: color 0.2s ease-in;
		}

		&.v-item--active {
			background: var(--v-primary-base) !important;

			.v-list-item__icon > i,
			.v-list-item__title {
				color: white !important;
				transition: color 0.2s ease-in;
			}
		}
	}
}
</style>
