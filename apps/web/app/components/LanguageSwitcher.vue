<template>
	<v-select
		filled
		dense
		height="46"
		background-color="body"
		prepend-inner-icon="mdi-translate"
		class="mt-2"
		item-value="code"
		item-text="name"
		v-model="locale"
		:items="$i18n.locales"
	></v-select>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator";

@Component({
	name: "LanguageSwitcher"
})
export default class extends Vue {
	locale = this.$i18n.locale;

	@Watch("locale")
	async onLocaleChanged(val: string) {
		this.$i18n.setLocale(val);
	}
}
</script>
