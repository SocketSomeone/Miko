/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
	public init(): void {}

	public async getMetrics(): Promise<string> {
		return '';
	}
}
