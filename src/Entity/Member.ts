import {
	Entity,
	BaseEntity,
	ManyToOne,
	JoinColumn,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToMany
} from 'typeorm';
import { BaseGuild } from './Guild';
import { Member } from 'eris';
import { Moment } from 'moment';
import { DateTransformer, BigNumberTransformer } from './Transformers/';

import BigNumber from 'bignumber.js';

BigNumber.config({
	FORMAT: {
		decimalSeparator: ',',
		groupSeparator: '.',
		groupSize: 3
	}
});

@Entity()
export class BaseMember extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: string;

	@Column({ nullable: false })
	public user: string;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'CASCADE', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ type: 'varchar', default: new BigNumber(0), transformer: BigNumberTransformer })
	public money: BigNumber;

	@Column({
		type: 'timestamp without time zone',
		nullable: true,
		transformer: DateTransformer
	})
	public timelyAt: Moment;

	@Column({ type: 'varchar', default: {}, array: true })
	public savedRoles: string[];

	static async get(user: Member) {
		const hasFounded = await this.findOne({
			where: {
				guild: {
					id: user.guild.id
				},
				user: user.id
			}
		});

		if (hasFounded) return hasFounded;

		const guild = await BaseGuild.get(user.guild.id);

		const member = new BaseMember();

		member.guild = guild;
		member.user = user.id;
		member.money = new BigNumber(guild.sets.prices.standart);

		await member.save();

		return member;
	}
}
