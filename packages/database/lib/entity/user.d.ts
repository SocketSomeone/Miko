import { UserEntity } from './base/UserEntity';
export declare class MiUser extends UserEntity<MiUser> {
    username: string;
    discriminator: string;
    avatarUrl: string;
    private lastUpdate;
}
//# sourceMappingURL=User.d.ts.map