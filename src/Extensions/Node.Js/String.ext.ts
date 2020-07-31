interface String {
	isNullOrEmpty(): boolean;
	markdown(type: string): string;
}

String.prototype.isNullOrEmpty = function (): boolean {
	return !this || this.length < 1;
};

String.prototype.markdown = function (type: string): string {
	return `\`\`\`${type ? type : ''}\n${this}\`\`\``;
};
