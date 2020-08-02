const { simpleflake } = require('simpleflakes');

export const snowFlakeID = () => {
	return simpleflake(Date.now(), 23, Date.UTC(2015, 0, 1));
};
