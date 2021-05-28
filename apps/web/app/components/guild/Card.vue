<template>
	<v-list color="body" rounded class="my-2 mx-3" three-line max-width="320">
		<v-list-item>
			<v-list-item-avatar size="80" color="primary" rounded="circle">
				<img data-not-lazy :src="guildUrl(guild)" />
			</v-list-item-avatar>

			<v-list-item-content class="d-flex align-start pt-4 pb-1">
				<v-list-item-title
					class="title pt-1 mb-1"
					v-text="guild.name"
				></v-list-item-title>

				<v-list-item-action class="mt-0 ml-0">
					<v-btn
						:outlined="!guild.added"
						color="primary"
						block
						class="py-2"
						:to="guild.added ? `/guilds/${guild.id}` : null"
						:href="
							guild.added
								? null
								: `https://discord.com/oauth2/authorize?scope=bot+applications.commands&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fguilds&permissions=1933044831&client_id=747038640571416666&guild_id=${guild.id}`
						"
					>
						<v-icon
							size="18"
							class="mr-3"
							v-text="guild.added ? 'mdi-cog' : 'mdi-link-variant'"
						></v-icon>
						{{ guild.added ? "Configure" : "Invite" }}
					</v-btn>
				</v-list-item-action>
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";
import CDN from "~/components/mixins/CDN";

@Component({
	name: "ServerCard",
	mixins: [CDN]
})
export default class extends Vue {
	@Prop()
	public guild: any;
}
</script>

