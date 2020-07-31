import { ValueTransformer } from 'typeorm';

import moment from 'moment';

export const DateTransformer: ValueTransformer = {
	from: (date) => (date ? moment(date) : null),
	to: (date) => (date ? date.toDate() : null)
};
