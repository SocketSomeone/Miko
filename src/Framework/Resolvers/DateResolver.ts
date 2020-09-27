import moment, { Moment } from 'moment';

import { Context } from '../Commands/Command';

import { Resolver } from './Resolver';

export class DateResolver extends Resolver {
	public async resolve(value: string, { funcs: { t } }: Context): Promise<Moment> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		return moment(value);
	}
}
