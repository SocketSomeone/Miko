export const ColorResolve = (data: string) => {
	const color = data.startsWith('#') ? data.substr(1) : data;

	return parseInt(color, 16);
};
