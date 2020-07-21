'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.BaseCache = void 0;
const moment_1 = __importDefault(require('moment'));
class BaseCache {
	constructor(client) {
		this.maxCacheDuration = moment_1.default.duration(6, 'h');
		this.cache = new Map();
		this.cacheMeta = new Map();
		this.pending = new Map();
		this.client = client;
	}
	async get(key) {
		const cached = this.cache.get(key);
		if (typeof cached !== 'undefined') {
			const meta = this.cacheMeta.get(key);
			if (meta && meta.validUntil.isAfter(moment_1.default())) {
				return cached;
			}
		}
		const res = this.pending.get(key);
		if (res) {
			return await res;
		}
		const promise = this._get(key).finally(() => this.pending.delete(key));
		this.pending.set(key, promise);
		const obj = await promise;
		this.cache.set(key, obj);
		this.cacheMeta.set(key, {
			cachedAt: moment_1.default(),
			validUntil: moment_1.default().add(this.maxCacheDuration)
		});
		return obj;
	}
	getCacheMeta(key) {
		return this.cacheMeta.get(key);
	}
	async set(key, value) {
		this.cache.set(key, value);
		this.cacheMeta.set(key, {
			cachedAt: moment_1.default(),
			validUntil: moment_1.default().add(this.maxCacheDuration)
		});
		return value;
	}
	has(key) {
		const meta = this.cacheMeta.get(key);
		return meta && this.cache.has(key) && meta.validUntil.isAfter(moment_1.default());
	}
	flush(key) {
		this.cache.delete(key);
		this.cacheMeta.delete(key);
	}
	clear() {
		this.cache = new Map();
		this.cacheMeta = new Map();
	}
	getSize() {
		return this.cache.size;
	}
}
exports.BaseCache = BaseCache;
//# sourceMappingURL=Cache.js.map
