<template>
	<div class="page-container pattern">
		<v-container class="error-container">
			<v-row
				class="flex-column-reverse flex-md-row justify-center align-center text-center"
			>
				<v-col cols="12" md="6" lg="7">
					<h1
						class="display-1 text-uppercase font-weight-medium text-highlight"
					>
						Something wrong
					</h1>

					<p class="display-1 font-weight-thin">{{ $props.error.message }}</p>

					<div class="group-btns flex-column flex-sm-row">
						<v-btn color="primary" large to="/">
							<v-icon size="18" class="mr-3">mdi-chevron-left</v-icon>
							Back to home
						</v-btn>

						<v-btn outlined color="primary" large @click="reload">
							<v-icon size="18" class="mr-3">mdi-reload</v-icon>
							Reload page
						</v-btn>
					</div>
				</v-col>

				<v-col cols="12" md="5" lg="4">
					<img
						class="miko"
						src="~assets/images/miko_error.svg"
						alt="miko.svg"
					/>
				</v-col>
			</v-row>
		</v-container>

		<WaveDivider bottom />
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
	name: "ErrorLayout",
	head: {
		title: "Error"
	}
})
export default class extends Vue {
	@Prop({ type: Object, default: null })
	public error!: any;

	reload() {
		location.reload();
	}
}
</script>

<style lang="scss">
.page-container {
	background-color: var(--v-body-base);

	.error-container {
		display: flex;
		padding: 70px 12px;
		position: relative;
		margin: 0 auto;
		width: fit-content;
	}
}
</style>
