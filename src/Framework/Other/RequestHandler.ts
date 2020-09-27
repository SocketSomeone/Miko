import { BaseClient } from '../../Client';

const RequestHandler = require('eris/lib/rest/RequestHandler');

export interface RequestStat {
	total: number;
	succeeded: number;
	errors: number;
}

export class BaseRequestHandler extends RequestHandler {
	public requestStats: Map<string, RequestStat> = new Map();

	public constructor(client: BaseClient, forceQueueing?: boolean) {
		super(client, forceQueueing);
	}

	public request(method: string, url: string, auth: boolean, body: any, file: any, _route: string, short: string) {
		const route = url
			.replace(/\/(?:[0-9]+)/g, `/:id`)
			.replace(/\/reactions\/[^/]+/g, '/reactions/:id')
			.replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token');

		const statKey = `${method}:${route}`;
		let info = this.requestStats.get(statKey);
		if (!info) {
			info = { total: 0, succeeded: 0, errors: 0 };
			this.requestStats.set(statKey, info);
		}

		info.total++;

		return super
			.request(method, url, auth, body, file, _route, short)
			.then((res: any) => {
				this.requestStats.get(statKey).succeeded++;
				return res;
			})
			.catch((err: any) => {
				this.requestStats.get(statKey).errors++;
				throw err;
			});
	}
}
