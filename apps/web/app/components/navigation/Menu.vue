<template>
	<div class="animated fadeInRight appButton">
		<v-btn
			class="mx-0"
			v-if="!$auth.loggedIn"
			color="primary"
			block
			height="40"
			outlined
			@click="$auth.loginWith('discord')"
		>
			{{ $t("header.login") }}
		</v-btn>

		<v-menu v-model="menu" offset-y v-else>
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					elevation="0"
					color="background"
					width="auto"
					x-large
					depressed
					v-bind="attrs"
					v-on="on"
					class="animated fadeInRight d-flex align-center justify-center"
				>
					<v-list-item-avatar color="accent" size="28">
						<img data-not-lazy :src="avatarUrl($auth.user)"  alt=''/>
					</v-list-item-avatar>

					<v-list-item-content
						class="caption hidden-md-and-down font-weight-medium"
						v-text="$auth.user.username"
					>
					</v-list-item-content>

					<v-list-item-action class="ml-0 ml-md-3">
						<v-icon dense>mdi-chevron-down</v-icon>
					</v-list-item-action>
				</v-btn>
			</template>

			<v-list color="background">
				<!-- <nuxt-link to="/premium" exact>
				<v-list-item link>
					<v-list-item-content
						class="body-2 text-center"
						v-text="$t('header.menu.premium')"
					>
					</v-list-item-content>
				</v-list-item>
			</nuxt-link> -->

				<nuxt-link to="/guilds" exact>
					<v-list-item link>
						<v-list-item-content
							class="body-2 text-center"
							v-text="$t('header.menu.servers')"
						>
						</v-list-item-content>
					</v-list-item>
				</nuxt-link>

				<v-list-item @click="$auth.logout('discord')">
					<v-list-item-content
						class="body-2 text-center red--text"
						v-text="$t('header.menu.logout')"
					>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-menu>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import CDN from "~/components/mixins/CDN";

@Component({
	name: "NavMenu",
	mixins: [CDN]
})
export default class extends Vue {
	public menu = false;
}
</script>

<style lang="scss">
.appButton {
	flex: 0 0 auto;
	max-width: 89px;
	text-align: end;
	display: flex;
	flex-flow: row-reverse;
}
</style>
