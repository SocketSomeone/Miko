import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { Guild, Message, PrivateChannel, GroupChannel, TextChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onMessageDeleteEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MESSAGE_DELETED);

		client.on('messageDelete', this.onHandle.bind(this));
	}

	private async onHandle(message: Message) {
		if (message.channel instanceof PrivateChannel || message.channel instanceof GroupChannel) return;

		if (!message.member) return;

		const guild = (message.channel as TextChannel).guild;

		if (!guild || message.member.bot) {
			return;
		}

		const [isCommand] = await this.client.commands.resolve(message, null, guild);

		if (isCommand) {
			return;
		}

		await super.handleEvent(guild, message);
	}

	public async execute(t: TranslateFunc, guild: Guild, { id, content, member, channel }: Message) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.messageDeleted'), icon_url: Images.MESSAGE_DELETE },
			color: Color.RED,
			title: t('logs.msgDeleted'),
			description: content.markdown(''),
			fields: [
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
			thumbnail: { url: member.avatarURL },
			footer: {
				text: `Member: ${member.id}, Message: ${id}`
			}
		});

		return embed;
	}
}
