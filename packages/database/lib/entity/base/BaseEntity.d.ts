import { BaseEntity } from 'typeorm';
export declare abstract class MiEntity<T> extends BaseEntity {
    id: string;
    constructor(opts?: Partial<T>);
    toString(): string;
}
//# sourceMappingURL=BaseEntity.d.ts.map