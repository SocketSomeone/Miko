import type { OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class MetricsService implements OnModuleInit {
	private logger = new Logger(MetricsService.name);

	public async onModuleInit() {
		this.logger.log('123');
	}

	@Interval(30000)
	public async persistMetrics() {
		this.logger.debug('Save metrics');
	}
}
