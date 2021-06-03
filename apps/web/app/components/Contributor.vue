<template>
	<v-slide-item>
		<v-card
			class="contributor-card ma-4 pa-5"
			height="220"
			width="160"
			elevation="6"
			color="background"
		>
			<v-avatar color="accent" size="98px" rounded="circle">
				<img
					v-if="useAvatar"
					:src="contributor.avatarUrl"
					@error="useAvatar = false"
					style="object-fit: cover"
				/>

				<span
					v-else
					v-text="contributor.username.slice(0, 1).toUpperCase()"
				></span>
			</v-avatar>

			<h4
				class="primary--text font-weight-medium pt-2"
				v-text="contributor.username"
			></h4>

			<p
				class="font-weight-regular caption"
				v-text="contributor.specialization"
			></p>

			<v-row justify="space-around" align="center" class="pt-1">
				<v-btn
					v-for="(l, i) in contributor.links"
					:key="i"
					icon
					link
					:href="l.url"
				>
					<v-icon size="20" v-text="'mdi-' + l.emoji"> </v-icon>
				</v-btn>
			</v-row>
		</v-card>
	</v-slide-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator";

@Component({
	name: "Contributor"
})
export default class extends Vue {
	@Prop()
	public contributor!: Object;

	public useAvatar = true;
}
</script>
