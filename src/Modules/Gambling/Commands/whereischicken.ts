import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Emoji, Message } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { chance } from '../../../Misc/Utils/Chance';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'whereischicken',
			aliases: ['wis'],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 20n),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			examples: ['1000']
		});
	}

	public async execute(message: Message, [money]: [bigint], { funcs: { t, e }, guild }: Context) {
		const person = await BaseMember.get(message.member);

		if (person.money < money) throw new ExecuteError(t('error.enough.money'));

		person.money -= money;
		await person.save();

		let doors = ['🚪', '🚪', '🚪'],
			timer: NodeJS.Timeout;

		const embed = this.createEmbed({
			title: t('gambling.wis.title'),
			description: t('gambling.wis.desc', {
				doors: doors.join(' ')
			})
		});

		const m = await this.sendAsync(message.channel, embed);

		const emojis = ['1️⃣', '2️⃣', '3️⃣'];

		for (const emoji of emojis) m.addReaction(emoji);

		const func = async (msg: Message, emoji: Emoji, userId: string) => {
			if (msg.id !== m.id || userId !== message.author.id) {
				return;
			}

			if (!emojis.includes(emoji.name)) {
				return;
			}

			clearTimeout(timer);
			this.client.removeListener('messageReactionAdd', func);

			await m.removeReactions();

			const nums = [1, 2, 3];

			const s = Number(emoji.name[0]);
			const c = chance.weighted(
				nums,
				nums.map((x) => (x === s ? 1 : 1.5))
			);

			doors[c - 1] = '🐣';

			if (s === c) {
				person.money += money * 2n;
				await person.save();
			}

			await m.edit({
				embed: {
					...embed,
					description: `${t('gambling.wis.desc', {
						doors: doors.join(' ')
					})}\n${t('gambling.wis.result', {
						result: s === c ? '🎉' : '☠'
					})}`,
					color: ColorResolve(s === c ? Color.GREEN : Color.RED)
				}
			});
		};

		this.client.addListener('messageReactionAdd', func);

		timer = setTimeout(async () => {
			await person.reload();

			person.money += money;
			await person.save();

			this.client.removeListener('messageReactionAdd', func);
			await m.removeReactions();
		}, 60 * 1000);
	}
}
