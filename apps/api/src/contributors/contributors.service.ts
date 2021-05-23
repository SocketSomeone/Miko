import { Repository } from '@miko/common';
import { Injectable } from '@nestjs/common';
import type { Contributor } from '@miko/database';
import { ContributorRepository } from '@miko/database';

@Injectable()
export class ContributorsService {
	@Repository()
	private contributorRepository: ContributorRepository;

	public async findAll(): Promise<Contributor[]> {
		return this.contributorRepository.find();
	}
}
