import { BaseEventLog } from '../Others/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Others/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Message, PrivateChannel, GroupChannel, TextChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';
import { Service } from '../../../Framework/Decorators/Service';
import { CommandService } from '../../../Framework/Services/Commands';

export default class onMessageDeleteEvent extends BaseEventLog {
	@Service() protected commands: CommandService;

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

		const [isCommand] = await this.commands.resolveCommand(message, null, guild);

		if (isCommand) {
			return;
		}

		await super.handleEvent(guild, message);
	}

	public async execute(t: TranslateFunc, guild: Guild, { id, content, member, channel }: Message) {
		const embed = this.messages.createEmbed({
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
