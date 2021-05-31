import { Repository, ContributorRepository } from '@miko/common';
import { Injectable } from '@nestjs/common';
import type { Contributor } from '@miko/common';

@Injectable()
export class ContributorsService {
	@Repository()
	private contributorRepository: ContributorRepository;

	public async findAll(): Promise<Contributor[]> {
		return this.contributorRepository.find();
	}
}
