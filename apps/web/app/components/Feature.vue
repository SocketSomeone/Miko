<template>
	<v-col
		cols="12"
		sm="6"
		md="4"
		class="feature flex-column justify-start align-center d-flex"
	>
		<v-icon color="primary" dense size="60">
			{{ `mdi-${feature.icon}` }}
		</v-icon>

		<h3
			class="feature-title"
			v-text="$t(`home.features.${feature.name}.heading`)"
		></h3>

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
	width: 100%;
	height: 250px;
	padding: 30px;
	text-align: center;
	border-radius: 20px;

	display: flex;
	justify-content: center;
	align-items: center;

	.feature-title {
		margin-top: 10px;
		margin-bottom: 10px;

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
