import { User } from 'eris';

declare module 'eris' {
	interface User {
		tag: string;
	}
}

Object.defineProperty(User.prototype, 'tag', {
	get: function tag(this: User) {
		return `${this.username}#${this.discriminator}`;
	}
});

console.log('1');
