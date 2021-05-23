import type { Contributor } from '@miko/database';
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';
import { ContributorsService } from './contributors.service';

@Public()
@Controller('/contributors')
export class ContributorsController {
	public constructor(private readonly contributorsService: ContributorsService) {}

	@Get()
	public async findAllContributors(): Promise<Contributor[]> {
		return this.contributorsService.findAll();
	}
}
