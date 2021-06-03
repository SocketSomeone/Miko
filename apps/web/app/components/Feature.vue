<template>
	<v-col
		cols="12"
		sm="6"
		md="4"
		class="animated fadeIn flex-column feature justify-center align-center d-flex"
	>
		<v-icon class="mb-4" color="primary" dense size="60">
			{{ `mdi-${feature.icon}` }}
		</v-icon>

		<h3
			class="feature-title"
			v-text="$t(`home.features.${feature.name}.heading`)"
		></h3>

		<v-chip
			small
			color="info"
			text-color="white"
			outlined
			class="mt-2 mb-3"
			v-text="'Coming Soon'"
		></v-chip>

		<p
			class="feature-description"
			v-text="$t(`home.features.${feature.name}.description`)"
		></p>
	</v-col>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
	name: "Feature"
})
export default class extends Vue {
	@Prop({ type: Object, required: true })
	public feature!: Object;
}
</script>

<style lang="scss">
.feature {
	min-height: 250px;
	text-align: center;
	border-radius: 10px;

	.feature-title {
		font-weight: bold;
		font-size: 20px;
		line-height: 24px;
	}

	.feature-description {
		max-width: 250px;
		font-weight: 400;
		font-size: 16px;
		line-height: 20px;
	}
}
</style>
