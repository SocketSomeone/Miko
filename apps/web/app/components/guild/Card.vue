<template>
	<v-list color="body" rounded class="my-2 mx-3" three-line max-width="320">
		<v-list-item>
			<v-list-item-avatar size="80" color="primary" rounded="circle">
			</v-list-item-avatar>

			<v-list-item-content class="pt-4 pb-1">
				<v-list-item-title class="title pt-1 mb-1"
					>xczxczxczxczxczxczxczxczxczxc</v-list-item-title
				>

				<v-list-item-action class="align-self-center mt-0">
					<v-btn outlined color="primary" class="py-2">
						<v-icon size="18" class="mr-3">mdi-link-variant</v-icon>
						Invite
					</v-btn>
				</v-list-item-action>
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component({
	name: "ServerCard"
})
export default class extends Vue {}
</script>

