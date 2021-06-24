<template>
	<v-container class="commands px-5">
		<v-row justify="center">
			<NavigationSidebar class="animated fadeIn">
				<v-list-item-group>
					<h3 class="primary--text pt-3">Search commands</h3>

					<v-text-field
						class="my-3"
						filled
						dense
						height="31"
						prepend-inner-icon="mdi-magnify"
						hide-details
						v-model="search"
					></v-text-field>
				</v-list-item-group>

				<v-list-item-group mandatory class="modules">
					<h3 class="primary--text mb-2">Modules</h3>

					<v-list-item v-for="(item, i) in nav" :key="i" class="mb-2" dense>
						<v-list-item-icon class="mr-3">
							<v-icon dense v-text="item.icon"></v-icon>
						</v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title v-text="item.text"></v-list-item-title>
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</NavigationSidebar>

			<v-col cols="12" sm="7" md="8" lg="9" class="animated fadeIn">
				<v-expansion-panels multiple accordion>
					<v-fade-transition v-for="n in commands" :key="n">
						<Command v-if="showCommand(n)" />
					</v-fade-transition>
				</v-expansion-panels>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "Commands",
	auth: false,
	head: {
		title: "Commands"
	}
})
export default class extends Vue {
	public nav = [
		{
			icon: "mdi-inbox",
			text: "All"
		},
		{
			icon: "mdi-star",
			text: "Moderation"
		},
		{
			icon: "mdi-send",
			text: "Private Rooms"
		},
		{
			icon: "mdi-email-open",
			text: "Actions"
		}
	];

	public search: string = "";

	public commands = [123, 55, 12, 1231, 123, 123, 1, 1, 13, 1];

	showCommand(command: number) {
		if (!this.search.length) return true;

		return command.toString().includes(this.search.toLowerCase());
	}
}
</script>

<style lang="scss" >
.commands {
	padding: 40px 0;
}
</style>
