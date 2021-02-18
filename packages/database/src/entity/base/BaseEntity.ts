import {PrimaryGeneratedColumn} from 'typeorm';

export abstract class MiEntity {
	@PrimaryGeneratedColumn('uuid')
	public id!: string;
}
