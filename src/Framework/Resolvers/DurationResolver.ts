import moment, { Duration } from 'moment';

import { Context } from '../commands/Command';

import { Resolver } from './Resolver';

const SECONDS_PER_DAY = 86400;

const SECONDS_POSTPREFIX = ['sec', 's', 'seconds', 'сек', 'с', 'секунд'];
const MINUTES_POSTPREFIX = ['min', 'm', 'minutes', 'мин', 'м', 'минута', 'минут'];
const HOURS_POSTPREFIX = ['hours', 'hour', 'h', 'час', 'часов', 'ч'];
const DAYS_POSTPREFIX = ['day', 'days', 'd', 'дней', 'день', 'дн', 'д'];
const WEEKS_POSTPREFIX = ['week', 'weeks', 'w', 'неделя', 'недель'];
const MONTHS_POSTPREFIX = ['month', 'months', 'mo', 'месяцев', 'месяц'];
const YEARS_POSTPREFIX = ['year', 'years', 'y', 'г', 'год', 'годов'];

export class DurationResolver extends Resolver {
	public async resolve(value: string, { funcs: { t } }: Context): Promise<Duration> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		let seconds = 0;

		const s = parseInt(value, 10);

		if (SECONDS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s;
		} else if (MINUTES_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * 60;
		} else if (HOURS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * 3600;
		} else if (DAYS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * SECONDS_PER_DAY;
		} else if (WEEKS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * 7 * SECONDS_PER_DAY;
		} else if (MONTHS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * 30 * SECONDS_PER_DAY;
		} else if (YEARS_POSTPREFIX.some((x) => value.includes(x))) {
			seconds = s * 365 * SECONDS_PER_DAY;
		} else {
			return moment.duration(value);
		}

		return moment.duration(seconds, 'second');
	}
}
