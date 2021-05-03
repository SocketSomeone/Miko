<template>
	<v-select
		filled
		dense
		height="46"
		background-color="body"
		prepend-inner-icon="mdi-translate"
		class="mt-2 control-item"
		item-value="code"
		item-text="name"
		:value="$i18n.locale"
		:items="$i18n.locales"
		@input="e => $i18n.setLocale(e)"
	></v-select>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "LanguageSwitcher"
})
export default class extends Vue {}
</script>

<style lang="scss">
</style>
