<template>
	<v-row class='d-block text-center'>
		<div class='page-container pattern'>
			<v-container class='contributors pt-5'>
				<h1
					class='section-header mx-2'
					v-text="$t('contributors.')"
				></h1>

				<v-slide-group center-active show-arrows>

					<Contributor
						:class="{ 'mx-auto': contributors.length <= 3 }"
						v-for='(c, i) in contributors'
						:contributor='c'
						:key='i'
					/>
				</v-slide-group>
			</v-container>

			<WaveDivider bottom />
		</div>

		<v-row class='help-container mt-5 mx-auto'>
			<h1 class='section-header' v-text="$t('contributors.start.heading')"></h1>

			<div class='group-btns flex-column flex-sm-row'>
				<v-btn color='primary' link to='premium'>
					<v-icon class='mr-2'>mdi-fire</v-icon>
					{{ $t('contributors.start.button.premium') }}
				</v-btn>

				<v-btn outlined color='primary' link href='mailto: support@mikoapp.xyz'>
					<v-icon class='mr-2'>mdi-hammer-wrench</v-icon>
					{{ $t('contributors.start.button.jobs') }}
				</v-btn>
			</div>
		</v-row>
	</v-row>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator';
import { Context } from '@nuxt/types';

@Component({
	name: 'Contributors',
	auth: false,
	head: {
		title: 'Contributors'
	}
})
export default class extends Vue {
	public contributors: unknown[] = [];

	async asyncData({ $axios }: Context) {
		const contributors = await $axios.$get('/contributors');

		return { contributors };
	}
}
</script>

<style scoped lang='scss'>
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
	padding-bottom: 40px;
}
</style>
