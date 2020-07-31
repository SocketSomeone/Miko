import { ValueTransformer } from 'typeorm';

import { duration, Duration } from 'moment';

export const DurationTransformer: ValueTransformer = {
	from: (str: string) => duration(str, 'minutes'),
	to: (duration: Duration) => duration.asMinutes().toString()
};
