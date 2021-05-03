<template>
	<v-layout d-block class="text-center">
		<div class="page-container pattern">
			<v-container class="contributors pt-5">
				<h1
					class="section-header mx-2 my-5"
					v-text="$t('contributors.developers')"
				></h1>

				<v-slide-group center-active show-arrows>
					<Contributor
						:class="{ 'mx-sm-auto': 2 <= 3 }"
						v-for="n in 3"
						:value="n"
						:key="n"
					/>
				</v-slide-group>
			</v-container>

			<WaveDivider bottom />
		</div>

		<v-row class="help-container mt-5 mx-auto">
			<h1
				class="section-header my-0"
				v-text="$t('contributors.start.heading')"
			></h1>

			<div class="group-btns flex-column flex-sm-row">
				<v-btn color="primary" link to="premium">
					<v-icon class="mr-2">mdi-fire</v-icon>
					{{ $t("contributors.start.button.premium") }}
				</v-btn>

				<v-btn outlined color="primary" link href="mailto: support@mikoapp.xyz">
					<v-icon class="mr-2">mdi-hammer-wrench</v-icon>
					{{ $t("contributors.start.button.jobs") }}
				</v-btn>
			</div>
		</v-row>
	</v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Contributors",
	auth: false,
	head: {
		title: "Contributors"
	}
})
export default class extends Vue {}
</script>

<style scoped lang="scss">
.help-container {
	width: fit-content !important;

	display: flex;
	flex-direction: column;
	align-items: center;

	padding: 10px 0;
}

h1 {
	font-size: 24px;
	font-weight: bold;
}

.contributors {
	max-width: 705px;
	padding-bottom: 80px;
}
</style>
