"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiMember = void 0;
const typeorm_1 = require("typeorm");
const GuildEntity_1 = require("./base/GuildEntity");
const User_1 = require("./User");
let MiMember = class MiMember extends GuildEntity_1.GuildEntity {
};
__decorate([
    typeorm_1.ManyToOne(() => User_1.MiUser, user => user.userId),
    typeorm_1.JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User_1.MiUser)
], MiMember.prototype, "user", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], MiMember.prototype, "displayName", void 0);
MiMember = __decorate([
    typeorm_1.Entity({ name: "members" })
], MiMember);
exports.MiMember = MiMember;
//# sourceMappingURL=Member.js.map