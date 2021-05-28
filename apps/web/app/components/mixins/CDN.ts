/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vue, Component } from 'nuxt-property-decorator';

declare module 'vue/types/vue' {
	interface Vue {
		avatarUrl(user: any): string | null;
	}
}

@Component
export default class extends Vue {
	guildUrl(guild: any): string | null {
		if (!guild) return null;

		return this.joinUrl(`icons/${guild.id}/${guild.icon}`);
	}

	avatarUrl(user: any): string | null {
		if (!user) return null;

		return this.joinUrl(`avatars/${user.id}/${user.avatar}.${user.premium_type >= 1 ? 'gif' : 'png'}`);
	}

	joinUrl(path: any): string {
		return `${this.$config.cdnUrl}${path}`;
	}
}
