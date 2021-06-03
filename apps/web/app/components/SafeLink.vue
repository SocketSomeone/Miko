<template>
	<a
		v-if="['https://', 'mailto'].some(i => link.startsWith(i))"
		:href="link"
	></a>

	<nuxt-link v-else :to="link" exact> </nuxt-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
	name: "SafeLink"
})
export default class extends Vue {
	@Prop({ type: String, required: true })
	public link!: string;
}
</script>
