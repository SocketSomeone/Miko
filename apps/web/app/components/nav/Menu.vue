<template>
	<div>
		<v-btn
			v-if="!$auth.loggedIn"
			color="primary"
			block
			rounded
			@click="$auth.loginWith('discord')"
		>
			<v-icon small class="mr-1">mdi-login-variant</v-icon>
			<!-- {{ $t("header.login") }} -->
			Login
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
					class="d-flex align-center justify-center"
				>
					<v-list-item-avatar color="accent" size="28">
						<img
							data-not-lazy
							:src="`https://cdn.discordapp.com/avatars/${$auth.user.id}/${
								$auth.user.avatar
							}.${$auth.user.premium_type >= 1 ? 'gif' : 'png'}`"
						/>
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

@Component({
	name: "NavMenu"
})
export default class extends Vue {
	public menu = false;
}
</script>
