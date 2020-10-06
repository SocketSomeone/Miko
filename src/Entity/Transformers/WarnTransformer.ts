import moment from 'moment';
import { ValueTransformer } from 'typeorm';
import { IWarn } from '../Member';

export const WarnTransformer: ValueTransformer = {
	from: (arr: IWarn[]) => arr.filter((x) => moment().isBefore(x.expireAt)),
	to: (arr: IWarn[]) => arr.filter((x) => moment().isBefore(x.expireAt))
};
