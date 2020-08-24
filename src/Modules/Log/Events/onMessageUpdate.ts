import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role, Member, Message, PrivateChannel, GroupChannel, TextChannel } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onMessageUpdateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MESSAGE_EDITED);

		client.on('messageUpdate', this.onHandle.bind(this));
	}

	private async onHandle(message: Message, oldMessage?: Message) {
		if (oldMessage && !message.editedTimestamp) return;

		if (message.channel instanceof PrivateChannel || message.channel instanceof GroupChannel) return;

		if (!message.member) return;

		const guild = (message.channel as TextChannel).guild;

		if (!guild || message.member.bot) {
			return;
		}

		await super.handleEvent(guild, message, oldMessage);
	}

	public async execute(t: TranslateFunc, guild: Guild, { member, content, channel }: Message, oldMessage: Message) {
		if (!oldMessage) {
			return;
		}

		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.messageUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.messageBefore'),
					value: oldMessage.content.markdown(''),
					inline: false
				},
				{
					name: t('logs.messageAfter'),
					value: content.markdown(''),
					inline: false
				},
				{
					name: t('logs.messageBy'),
					value: member.mention,
					inline: true
				},
				{
					name: t('logs.channel'),
					value: channel.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}
}
