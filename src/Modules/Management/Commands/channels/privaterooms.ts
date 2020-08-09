import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { StringResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, VoiceChannel } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Enums/GuildPermissions';
import { ChannelType } from '../../../../Types';
import { PrivateService } from '../../../Configure/Services/PrivateSystem';

export default class extends Command {
	private system: PrivateService;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'privaterooms',
			aliases: ['pr', 'приватки'],
			args: [],
			group: CommandGroup.MANAGEMENT,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});

		this.system = new PrivateService(client);
	}

	public async onLoaded() {
		await this.system.init();
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		settings.privateManager = settings.privateManager
			? await this.deleteManager(guild, settings.privateManager)
			: await this.createManager(guild);

		await this.client.cache.guilds.updateOne(guild);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.privates.${settings.privateManager ? 'enabled' : 'disabled'}`, {
				channel: `<#${settings.privateManager}>`
			}),
			footer: {
				text: ''
			}
		});
	}

	protected async createManager(guild: Guild): Promise<string> {
		const channel = await guild.createChannel('🏠 Создать домик Miko', ChannelType.GUILD_VOICE);

		return channel.id;
	}

	protected async deleteManager(guild: Guild, c: string): Promise<null> {
		if (!guild.channels.get(c)) return null;

		const channel = guild.channels.get(c);
		channel.delete().catch(() => undefined);

		return null;
	}
}
