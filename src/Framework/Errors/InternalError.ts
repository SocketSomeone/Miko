export abstract class InternalError extends Error {
	public isWarn = false;
	public fallbackUser = false;

	constructor(data: string) {
		super();

		this.message = data;
	}
}
