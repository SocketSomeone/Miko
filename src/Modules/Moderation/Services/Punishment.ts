import { EmbedField, Guild, Member, PrivateChannel, User } from 'eris';
import { BaseGuild } from '../../../Entity/Guild';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { BasePunishment, Punishment } from '../../../Entity/Punishment';
import { Service } from '../../../Framework/Decorators/Service';
import { BaseService } from '../../../Framework/Services/Service';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { ModerationService } from './Moderation';

type PunishmentFunctions = {
	[key in Punishment]: (guild: Guild, member: Member, settings: BaseSettings) => Promise<boolean>;
};

export class PunishmentService extends BaseService {
	@Service(() => ModerationService) protected mod: ModerationService;

	private punishmentFunctions: PunishmentFunctions = {
		[Punishment.BAN]: this.ban.bind(this),
		[Punishment.KICK]: this.kick.bind(this),
		[Punishment.SOFTBAN]: this.softban.bind(this),
		[Punishment.MUTE]: this.mute.bind(this)
	};

	public async punish(
		guild: Guild,
		member: Member,
		type: Punishment,
		settings: BaseSettings,
		modAndReason?: { user: Member; reason: string },
		extra?: EmbedField[]
	) {
		const func = this.punishmentFunctions[type];
		if (!func) {
			return;
		}

		await this.informAboutPunishment(member, type, extra);

		const punishmentResult = await func(guild, member, settings);
		if (!punishmentResult) {
			return;
		}

		const moderator = modAndReason ? modAndReason.user : this.client.user;

		await BasePunishment.savePunishment({
			guild: BaseGuild.create({ id: guild.id }),
			type,
			reason: modAndReason ? modAndReason.reason : null,
			moderator: moderator.id,
			member: member.id
		});

		await this.mod.logModAction(guild, settings, moderator, member, type, extra);
	}

	private async informAboutPunishment(member: Member, type: Punishment, extra?: { name: string; value: string }[]) {
		const dmChannel: PrivateChannel = await member.user.getDMChannel().catch(() => undefined);

		if (!dmChannel) {
			return;
		}

		return dmChannel
			.createMessage({
				embed: {
					color: ColorResolve(Color.DARK),
					author: {
						name: `[${type.toUpperCase()}] ${member.guild.name}`,
						icon_url: member.guild.iconURL
					},
					fields: extra
						.filter((x) => !!x.value)
						.map((e) => {
							return {
								name: e.name,
								value: e.value.substr(0, 1024),
								inline: true
							};
						}),
					timestamp: new Date().toISOString(),
					footer: null
				}
			})
			.catch(() => undefined);
	}

	private async ban(guild: Guild, member: Member, settings: BaseSettings) {
		try {
			await member.ban(7, 'automod');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async kick(guild: Guild, member: Member, settings: BaseSettings) {
		try {
			await member.kick('automod');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async softban(guild: Guild, member: Member, settings: BaseSettings) {
		try {
			await member.ban(7, 'automod');
			await member.unban('softban');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async mute(guild: Guild, member: Member, settings: BaseSettings) {
		const mutedRole = settings.moderation.muteRole;
		if (!mutedRole || !guild.roles.has(mutedRole)) {
			return false;
		}

		try {
			await member.addRole(mutedRole, 'AutoMod muted');
			return true;
		} catch (error) {
			return false;
		}
	}
}
