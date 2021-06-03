import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';
import { MetricsService } from './metrics.service';

@Public()
@Controller()
export class MetricsController {
	public constructor(private metricsService: MetricsService) {}

	@Get('/stats')
	public getStats(): string {
		return;
	}

	@Get('/metrics')
	public getMetrics(): Promise<string> {
		return this.metricsService.getMetrics();
	}
}
