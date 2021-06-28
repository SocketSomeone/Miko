export class GuildDTO {
	public id: string;

	public name: string;

	public icon: string;

	public added: boolean;

	public constructor(opts: Partial<GuildDTO>) {
		Object.assign(this, opts);
	}
}
