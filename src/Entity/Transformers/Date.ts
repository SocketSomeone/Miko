import { ValueTransformer } from 'typeorm';

import moment, { Moment } from 'moment';

export const DateTransformer: ValueTransformer = {
	from: (date: Date) => (date ? moment(date) : null),
	to: (date: Moment) => {
		if (!date) {
			return null;
		}

		return date.toDate();
	}
};
