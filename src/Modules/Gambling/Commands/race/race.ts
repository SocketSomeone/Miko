import { Embed, Member, Message } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { BaseModule } from '../../../../Framework/Module';
import { BigIntResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Game } from './game';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'race',
			aliases: [],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 20n),
					required: true
				}
			],
			group: CommandGroup.GAMBLING,
			guildOnly: true,
			premiumOnly: false,
			examples: ['1000'],
			botPermissions: [
				GuildPermission.ADD_REACTIONS,
				GuildPermission.READ_MESSAGE_HISTORY,
				GuildPermission.READ_MESSAGES
			]
		});
	}

	public async execute(
		message: Message,
		[money]: [bigint],
		{ funcs: { t, e }, guild, settings: { currency } }: Context
	) {
		const person = await BaseMember.get(message.member);

		if (person.money < money) throw new ExecuteError(t('error.enough.money'));

		person.money -= money;
		await person.save();

		const game = new Game(message.member);

		let gameMessage: Message;

		const sendGameMessage = async () => {
			const embed = this.createEmbed({
				title: t('gambling.race.title', { money }),
				description: t('gambling.race.bet', {
					bet: `${money} ${e(currency)}`
				}),
				fields: [
					{
						name: t('gambling.race.players'),
						value: game.cars
							.map((x, i) => {
								return `\\${x} ${x.isBot ? t('gambling.race.bot', { i }) : x.member} ${
									x.place ? t('gambling.race.finished', { place: x.place }) : ''
								}`;
							})
							.join('\n'),
						inline: false
					},
					{
						name: t('gambling.race.map'),
						value: game.toString().markdown(''),
						inline: true
					},
					{
						name: '\u200b',
						value: '\u200b',
						inline: true
					}
				],
				footer: {
					text: t('gambling.race.footer'),
					icon_url: this.client.user.dynamicAvatarURL('png')
				}
			});

			if (gameMessage) {
				return gameMessage.edit({ embed }).catch(() => (gameMessage = undefined));
			}

			gameMessage = await this.replyAsync(message, embed);

			return gameMessage;
		};

		game.once('init', async () => {
			await sendGameMessage();

			await this.awaitReactions(
				gameMessage,
				async (userId) => {
					if (userId === this.client.user.id) return;
					if (game.cars.length >= game.maxPlayers || game.players.has(userId) || game.started) return;

					const member = await guild.getRESTMember(userId);
					const person = await BaseMember.get(member);

					if (person.money < money) return;

					person.money -= money;
					await person.save();

					game.addPlayer(member);
				},
				{
					ttl: 30 * 1000,
					reactions: ['👍']
				}
			);

			await game.start();
		});

		game.once('winner', async (member: Member) => {
			const person = await BaseMember.get(member);
			person.money += money * BigInt(game.players.size === 1 ? 2 : game.players.size);
			await person.save();
		});

		game.on('gameUpdate', sendGameMessage);

		game.init();
	}
}
