import moment, { Duration } from 'moment';

import { Context } from '../commands/Command';

import { Resolver } from './Resolver';

const SECONDS_PER_DAY = 86400;

const SECONDS_POSTPREFIX = new Set(['sec', 's', 'seconds', 'сек', 'с', 'секунд']);
const MINUTES_POSTPREFIX = new Set(['min', 'm', 'minutes', 'мин', 'м', 'минута', 'минут']);
const HOURS_POSTPREFIX = new Set(['hours', 'hour', 'h', 'час', 'часов', 'ч']);
const DAYS_POSTPREFIX = new Set(['day', 'days', 'd', 'дней', 'день', 'дн', 'д']);
const WEEKS_POSTPREFIX = new Set(['week', 'weeks', 'w', 'неделя', 'недель']);
const MONTHS_POSTPREFIX = new Set(['month', 'months', 'mo', 'месяцев', 'месяц']);
const YEARS_POSTPREFIX = new Set(['year', 'years', 'y', 'г', 'год', 'годов']);

export class DurationResolver extends Resolver {
	public async resolve(value: string, { funcs: { t } }: Context): Promise<Duration> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		let seconds = 0;

		const s = parseInt(value, 10);

		if (SECONDS_POSTPREFIX.has(value)) {
			seconds = s;
		} else if (MINUTES_POSTPREFIX.has(value)) {
			seconds = s * 60;
		} else if (HOURS_POSTPREFIX.has(value)) {
			seconds = s * 3600;
		} else if (DAYS_POSTPREFIX.has(value)) {
			seconds = s * SECONDS_PER_DAY;
		} else if (WEEKS_POSTPREFIX.has(value)) {
			seconds = s * 7 * SECONDS_PER_DAY;
		} else if (MONTHS_POSTPREFIX.has(value)) {
			seconds = s * 30 * SECONDS_PER_DAY;
		} else if (YEARS_POSTPREFIX.has(value)) {
			seconds = s * 365 * SECONDS_PER_DAY;
		} else {
			return moment.duration(value);
		}

		return moment.duration(seconds, 'second');
	}
}
