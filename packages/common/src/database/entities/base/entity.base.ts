import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	public id!: string;

	@UpdateDateColumn()
	public updatedAt!: Date;

	@CreateDateColumn()
	public createdAt!: Date;
}
