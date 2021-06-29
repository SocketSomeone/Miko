<template>
	<v-expansion-panel class='command'>
		<v-expansion-panel-header>
			<v-row align='center'>
				<div>
					<v-chip color='primary' small>cmd</v-chip>

					<span>—</span>

					<span style='line-height: 25px' class='font-weight-regular'>
						Command description
					</span>
				</div>
			</v-row>
		</v-expansion-panel-header>

		<v-expansion-panel-content>
			<p class='mt-3'>Some content</p>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator';

@Component({
	name: 'Command'
})
export default class extends Vue {
}
</script>

<style lang='scss'>
.command.v-expansion-panel {
	background: var(--v-body-base) !important;
	margin-bottom: 10px;
	border-radius: 5px !important;

	&::after {
		border: none !important;
	}

	.v-expansion-panel-content {
		background: var(--v-body-darken1) !important;
		border-radius: 5px !important;
	}
}
</style>
