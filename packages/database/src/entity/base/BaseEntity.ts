import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

export abstract class MiEntity<T> extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id!: string

    public constructor(opts?: Partial<T>) {
        super();

        if (opts) {
            Object.assign(this, opts);
        }
    }

    public toString() {
        return `${ this.constructor.name } [ID=${this.id}]`
    }
}