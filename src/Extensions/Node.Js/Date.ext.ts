interface Date {
	format(format?: string): string;
}

Date.prototype.format = function (format: string = 'DD [дн.] HH [час.] mm [мин.]') {
	let miliseconds = Number(this.getTime() - Date.now());
	return require('moment').duration(miliseconds).format(format);
};
