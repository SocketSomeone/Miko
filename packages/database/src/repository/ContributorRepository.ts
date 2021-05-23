import { EntityRepository, Repository } from 'typeorm';
import { Contributor } from '../entity';

@EntityRepository(Contributor)
export class ContributorRepository extends Repository<Contributor> {}
