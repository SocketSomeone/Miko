import { BaseService } from '../../../Framework/Services/Service';
import { BaseClient } from '../../../Client';
import { BaseEventLog } from '../Misc/EventLog';
import { LogType } from '../Misc/LogType';
import { resolve, relative } from 'path';
import { glob } from 'glob';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { TextChannel, Member } from 'eris';

import i18n from 'i18n';
import { Color } from '../../../Misc/Enums/Colors';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { Punishment } from '../../../Entity/Punishment';
import { Images } from '../../../Misc/Enums/Images';

interface ModLogContext {
	t: TranslateFunc;
	sets: BaseSettings;
	member: Member;
	target: Member;
	type: Punishment | string;
	extra?: {
		name: string;
		value: string;
	}[];
}

export class LoggingService extends BaseService {
	private logs: Map<LogType, BaseEventLog> = new Map();

	public constructor(client: BaseClient) {
		super(client);
	}

	public async init() {
		console.log('Loading log events...');

		const files = glob.sync('./bin/Modules/Log/Events/*.js');

		for (const file of files) {
			const clazz = require(resolve(__dirname, `../../../../${file}`));

			if (clazz) {
				const constr = clazz.default;
				const parent = Object.getPrototypeOf(constr);

				if (!parent || parent.name !== 'BaseEventLog') {
					continue;
				}

				const inst: BaseEventLog = new constr(this.client);

				if (this.logs.has(inst.type)) {
					console.error(`Duplicate event log #${inst.type} in ${relative(process.cwd(), file)}`);
					process.exit(1);
				}

				this.logs.set(inst.type, inst);
			}
		}

		console.log(`Loaded ${this.logs.size} events log.`);
	}

	public async logModAction({ t, sets, member, target, type, extra }: ModLogContext) {
		if (!sets.modlog) return;

		const modLogChannel = member.guild.channels.get(sets.modlog) as TextChannel;

		if (!modLogChannel) return;

		extra = extra || [];

		const embed = this.client.messages.createEmbed({
			color: Color.DARK,
			thumbnail: { url: member.avatarURL },
			author: {
				name: `[${String(type).toUpperCase()}] ` + t('logs.mod.title'),
				icon_url: Images.MODERATION
			},
			fields: [
				{
					name: t('logs.mod.user'),
					value: target.mention,
					inline: true
				},
				{
					name: t('logs.mod.moderator'),
					value: member.mention,
					inline: true
				},
				...extra.map((e) => {
					return {
						name: t(e.name),
						value: e.value,
						inline: true
					};
				})
			],
			footer: null
		});

		await this.client.messages.sendEmbed(modLogChannel, embed);
	}
}
