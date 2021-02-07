"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
/* eslint-disable @typescript-eslint/ban-types */
const __1 = require("..");
const metadata_1 = require("../metadata");
function Client() {
    return (target, key) => {
        const implicitCache = Reflect.getMetadata('design:type', target, key);
        if (implicitCache !== __1.MiClient) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have defined type`);
        }
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metadata_1.metaStorage.client; }
        });
    };
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map