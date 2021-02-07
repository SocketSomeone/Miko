import { BaseEntity, Column } from 'typeorm';
import { MiEntity } from './BaseEntity';

export abstract class UserEntity<T> extends MiEntity<T> {
    @Column("bigint", { name: 'user_id' })
    public userId!: string;
}