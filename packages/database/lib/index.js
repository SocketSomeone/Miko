"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnection = exports.Connection = void 0;
var typeorm_1 = require("typeorm");
Object.defineProperty(exports, "Connection", { enumerable: true, get: function () { return typeorm_1.Connection; } });
Object.defineProperty(exports, "createConnection", { enumerable: true, get: function () { return typeorm_1.createConnection; } });
__exportStar(require("./entity"), exports);
//# sourceMappingURL=index.js.map