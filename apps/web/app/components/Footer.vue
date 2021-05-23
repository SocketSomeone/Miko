<template>
	<v-footer padless color="background">
		<v-container class="pb-1">
			<v-row class="footer-container px-0" justify="space-between">
				<v-col cols="12" md="4" lg="3">
					<h3 class="primary--text" v-text="$t('footer.infoBox.heading')"></h3>
					<p v-text="$t('footer.infoBox.paragraph')"></p>

					<div class="controls">
						<v-btn block color="primary" large>
							<v-icon size="18" class="mr-3">mdi-discord</v-icon>
							{{ $t("footer.infoBox.button.invite") }}
						</v-btn>

						<LanguageSwitcher class="hidden-lg-and-up" />
					</div>
				</v-col>

				<v-col class="hidden-md-and-down" lg="2">
					<LanguageSwitcher />
				</v-col>

				<v-col
					cols="6"
					sm="3"
					md="2"
					lg="1"
					v-for="[category, items] in links()"
					:key="category"
					class="text-center text-sm-left d-flex flex-column"
				>
					<h3 class="primary--text" v-text="category"></h3>

					<div
						class="d-flex flex-row justify-center align-center justify-sm-start font-weight-regular"
						v-for="(item, i) in items"
						:key="i"
					>
						<img v-if="item.icon" :src="item.icon" class="mr-2 vote-icon" />

						<SafeLink
							class="white--text"
							:link="item.route"
							v-text="item.name"
						/>
					</div>
				</v-col>
			</v-row>

			<v-divider class="mx-auto mt-5 mb-2"></v-divider>

			<v-col cols="12" class="caption text-center copyright">
				©&nbsp;{{ new Date().getFullYear() }} — Miko by&nbsp;
				<span class="text-highlight">SocketSomeone</span>
			</v-col>
		</v-container>
	</v-footer>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

import BodVote from "../assets/images/BodVote.svg";
import TopVote from "../assets/images/TopVote.svg";
import BotsVote from "../assets/images/BotsVote.svg";

@Component({
	name: "Footer",
	components: { BodVote, TopVote, BotsVote }
})
export default class extends Vue {
	links() {
		return new Map([
			[
				this.$t("footer.links.find.heading"),
				[
					{
						icon: TopVote,
						route: "https://vk.com",
						name: "Top.gg"
					},
					{ icon: BotsVote, route: "/", name: "Bots.gg" },
					{ icon: BodVote, route: "/", name: "BoD.gg" }
				]
			],
			[
				this.$t("footer.links.product.heading"),
				[
					{
						route: "https://ivnite.mikoapp.xyz",
						name: this.$t("footer.links.product.invite")
					},
					{
						route: "https://discord.mikoapp.xyz",
						name: this.$t("footer.links.product.support")
					},
					{
						route: "/commands",
						name: this.$t("footer.links.product.commands")
					},
					{
						route: "/contributors",
						name: this.$t("footer.links.product.contributors")
					}
				]
			],
			[
				this.$t("footer.links.support.heading"),
				[
					{
						route: "https://translate.mikoapp.xyz",
						name: this.$t("footer.links.support.translate")
					},
					{
						route: "/premium",
						name: this.$t("footer.links.support.premium")
					},
					{
						route: "mailto: support@mikoapp.xyz",
						name: this.$t("footer.links.support.jobs")
					}
				]
			],
			[
				this.$t("footer.links.policies.heading"),
				[
					{ route: "/cookies", name: this.$t("footer.links.policies.cookies") },
					{ route: "/tos", name: this.$t("footer.links.policies.tos") },
					{ route: "/privacy", name: this.$t("footer.links.policies.privacy") }
				]
			]
		]).entries();
	}
}
</script>

<style lang="scss">
.footer-container {
	padding: 20px 0 0;

	.controls {
		max-width: 350px;

		@media (max-width: 599px) {
			max-width: none;
		}
	}
}

.copyright {
	@media only screen and (max-width: 960px) {
		margin-bottom: 60px;
	}
}
</style>
