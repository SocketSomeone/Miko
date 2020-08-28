export class ExecuteError extends Error {
	constructor(data: string) {
		super();

		this.message = data;
	}
}
