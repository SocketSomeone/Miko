import { Module } from '@nestjs/common';
import { ContributorsController } from './contributors.controller';
import { ContributorsService } from './contributors.service';

@Module({
	imports: [],
	controllers: [ContributorsController],
	providers: [ContributorsService]
})
export class ContributorsModule {}
