import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { MemberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, VoiceState, OldVoiceState } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { createQueryBuilder, In, Any } from 'typeorm';
import { BaseGuild } from '../../../Entity/Guild';

export default class extends Command {
	// private intervals: {
	// 	[str: string]: NodeJS.Timeout;
	// } = {};

	public constructor(client: BaseClient) {
		super(client, {
			name: 'bal',
			aliases: ['$', 'balance'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: false
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});

		// this.client.on('onModulesReady', this.onConnect.bind(this));
		// this.client.on('voiceChannelJoin', this.onJoin.bind(this));
		// this.client.on('voiceChannelLeave', this.onLeave.bind(this));
	}

	// public async onConnect() {
	// 	const guilds = await this.client.guilds;

	// 	for (const [, guild] of guilds) {
	// 		const members = guild.members.filter((x) => !!x.voiceState.channelID);

	// 		members.map((x) => this.onJoin(x));
	// 	}
	// }

	// public onJoin(member: Member) {
	// 	if (this.intervals[member.id])
	// 		return;

	// 	this.intervals[member.id] = setInterval(async () => {
	// 		const person = await BaseMember.get(member);

	// 		person.voiceOnline.add(1, 'minutes');

	// 		await person.save();
	// 	}, 60 * 1000);
	// }

	// public onLeave(member: Member) {
	// 	if (!this.intervals[member.id])
	// 		return;

	// 	clearInterval(this.intervals[member.id]);
	// 	delete this.intervals[member.id];
	// }

	public async execute(message: Message, [user]: [Member], { funcs: { t, e }, guild, settings }: Context) {
		const target = user || message.member;
		const person = await BaseMember.get(target);

		await this.sendAsync(message.channel, t, {
			title: t('economy.bal.title', {
				member: `${target.user.username}#${target.user.discriminator}`
			}),
			description: t('economy.bal.desc', {
				member: target.user.mention,
				amount: `${person.money.toFormat()} ${e(settings.emojis.wallet)}`
			})
		});
	}
}
