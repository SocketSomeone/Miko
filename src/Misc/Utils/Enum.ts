export default (e: any, val: string) => {
	return Object.keys(e).find((x) => e[x] === val) || '';
};
