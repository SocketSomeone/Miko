import { BaseService } from '../Service';
import { Guild } from 'eris';
import { ScheduledAction, BaseScheduledAction } from '../../../Entity/ScheduledAction';
import { In, Not } from 'typeorm';

import chalk from 'chalk';
import moment from 'moment';
import { withScope, captureException } from '@sentry/node';

type ScheduledActionsFunctions = {
	[k in ScheduledAction]: (guild: Guild, args: any) => Promise<boolean>;
};

export class SchedulerService extends BaseService {
	private scheduledActionTimers: Map<number, NodeJS.Timer> = new Map();
	private scheduledActionsFuncs: ScheduledActionsFunctions = {
		[ScheduledAction.unmute]: (g, a) => this.unmute(g, a)
	};

	public async onClientReady() {
		await this.scheduleScheduledActions();

		await super.onClientReady();
	}

	public async createTimer(action: BaseScheduledAction) {
		const millisUntilAction = Math.max(1000, action.date.diff(moment(), 'milliseconds'));

		const func = async () => {
			const guild = this.client.guilds.get(action.guild.id);

			if (!guild) {
				console.error('COULD NOT FIND GUILD FOR SCHEDULED FUNCTION', action.guild.id);
				return;
			}

			try {
				const scheduledFunc = this.scheduledActionsFuncs[action.type];

				if (scheduledFunc) {
					await scheduledFunc(guild, JSON.parse(action.args));
				}

				await action.remove();
			} catch (error) {
				withScope((scope) => {
					scope.setExtra('action', JSON.stringify(action));
					captureException(error);
				});
			}
		};

		console.log(`Scheduling timer in ${chalk.blue(millisUntilAction)}ms for action ${chalk.blue(action.id)}`);
		const timer = setTimeout(func, millisUntilAction);
		this.scheduledActionTimers.set(action.id, timer);
	}

	public async scheduleScheduledActions() {
		let actions = await BaseScheduledAction.find({
			where: {
				guild: {
					id: In(this.client.guilds.map((g) => g.id))
				}
			}
		});

		actions = actions.filter((x) => !!x.date);

		console.log(`Scheduling ${chalk.blue(actions.length)} actions from DB`);

		actions.map((a) => this.createTimer(a));
	}

	public async removeScheduledAction(action: BaseScheduledAction) {
		const timer = this.scheduledActionTimers.get(action.id);

		if (timer) {
			clearTimeout(timer);
			this.scheduledActionTimers.delete(action.id);
		}

		await action.remove();
	}

	private async unmute(guild: Guild, { memberId, roleId }: { memberId: string; roleId: string }) {
		console.log('SCHEDULED TASK: UNMUTE', guild.id, memberId);

		let member = guild.members.get(memberId);

		if (!member) {
			member = await guild.getRESTMember(memberId);
		}

		if (!member) {
			console.error('SCHEDULED TASK: UNMUTE: COULD NOT FIND MEMBER', memberId);
			return false;
		}

		await member.removeRole(roleId, '⚠ Punishment is timed out');
		return true;
	}
}
