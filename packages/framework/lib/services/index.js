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
exports.MiService = void 0;
const logger_1 = require("@miko/logger");
const __1 = require("..");
class MiService {
    constructor() {
        this.logger = new logger_1.Logger(this.constructor.name);
    }
    async init() {
        this.logger.log('Service is initialized!');
    }
}
__decorate([
    __1.Client(),
    __metadata("design:type", __1.MiClient)
], MiService.prototype, "client", void 0);
exports.MiService = MiService;
//# sourceMappingURL=index.js.map