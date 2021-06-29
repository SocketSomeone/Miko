<template>
	<v-app>
		<Header />

		<v-main>
			<nuxt />
		</v-main>

		<Footer />
	</v-app>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator';
import Footer from '~/components/Footer.vue';

@Component({
	name: 'Default',
	components: { Footer }
})
export default class extends Vue {
}
</script>
