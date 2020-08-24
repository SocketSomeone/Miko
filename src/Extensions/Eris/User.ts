import { User } from 'eris';

declare module 'eris' {
	interface User {
		tag: string;
	}
}

Object.defineProperty(User.prototype, 'tag', {
	get: function colorEmbed(this: User) {
		return `${this.username}#${this.discriminator}`;
	}
});
