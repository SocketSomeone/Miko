import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'autosave',
			aliases: ['saveroles'],
			args: [],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});

		this.client.on('guildMemberAdd', this.returnRoles.bind(this));
		this.client.on('guildMemberRemove', this.saveRoles.bind(this));
	}

	public async returnRoles(guild: Guild, member: Member) {
		if (member.user.bot) return;

		const settings = await this.client.cache.guilds.get(guild.id);

		if (!settings.saveroles) return;

		const person = await BaseMember.get(member);
		const me = guild.members.get(this.client.user.id);

		if (person.savedRoles && person.savedRoles.length > 0) {
			if (!me.permission.has(GuildPermission.MANAGE_ROLES)) {
				console.log(`TRYING TO SET JOIN ROLES IN ${guild.id} WITHOUT MANAGE_ROLES PERMISSION`);
				return;
			}

			await member.edit(
				{
					roles: this.client.moderation.editableRoles(guild, person.savedRoles, me).map((x) => x.id)
				},
				'Saved Roles'
			);
		}
	}

	public async saveRoles(guild: Guild, member: Member) {
		if (member.user.bot) return;

		const settings = await this.client.cache.guilds.get(guild.id);

		if (!settings.saveroles) return;

		const person = await BaseMember.get(member);
		person.savedRoles = member.roles;
		await person.save();
	}

	public async execute(message: Message, []: [], { funcs: { t, e }, guild, settings }: Context) {
		settings.saveroles = !settings.saveroles;
		await this.client.cache.guilds.updateOne(guild);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('modules.configure.title'),
			description: t(`modules.configure.autosave.${settings.saveroles ? 'enable' : 'disable'}`)
		});
	}
}
