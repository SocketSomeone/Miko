export class ExecuteIgnore extends Error {
	constructor() {
		super('Ignored by user');
	}
}
