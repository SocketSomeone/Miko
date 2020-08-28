import { User, Member } from 'eris';

declare module 'eris' {
	interface User {
		tag: string;

		toString(): string;
	}
	interface Member {
		tag: string;
		name: string;

		toString(): string;
	}
}

User.prototype.toString = toString;

Object.defineProperty(User.prototype, 'tag', {
	get: function tag(this: User) {
		return `${this.username}#${this.discriminator}`;
	}
});

Member.prototype.toString = toString;

Object.defineProperty(Member.prototype, 'tag', {
	get: function tag(this: Member) {
		return `${this.username}#${this.discriminator}`;
	}
});

Object.defineProperty(Member.prototype, 'name', {
	get: function name(this: Member) {
		return this.tag;
	}
});

function toString(this: Member | User) {
	return this.mention;
}
