import { Guild, Member } from 'eris';
import moment from 'moment';
import { BaseMember } from '../../../Entity/Member';
import { BaseService } from '../../../Framework/Services/Service';
import { Violation } from '../../../Misc/Enums/Violation';

export class WarnService extends BaseService {
	public async addWarn(member: Member, reason: string) {
		const person = await BaseMember.get(member);

		let warnsBefore = person.warns.length;

		if (isNaN(warnsBefore) || !isFinite(warnsBefore)) {
			warnsBefore = 0;
		}

		person.warns.push({
			createdAt: moment().toDate(),
			moderator: this.client.user.id,
			expireAt: moment().add(7, 'd').toDate()
		});

		await person.save();

		return { warnsBefore, warnsAfter: warnsBefore + 1 };
	}
}
