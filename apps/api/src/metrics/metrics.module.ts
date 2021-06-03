import type { OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
	controllers: [MetricsController],
	providers: [MetricsService]
})
export class MetricsModule implements OnModuleInit {
	public constructor(private metricSerivce: MetricsService) {}

	public onModuleInit(): void {
		this.metricSerivce.init();
	}
}
