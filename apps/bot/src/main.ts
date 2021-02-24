import { Logger } from 'tslog';
import { BootstrapService } from './utils/bootstrap';

const logger = new Logger({ name: 'ROOT' });

const main = async () => {
	await BootstrapService.startMiko();
};

main().catch(err => logger.error(err));
