import { Global, Module } from '@nestjs/common';
import { InternalCommandGateway } from './internal-command.gateway';

@Global()
@Module({
	providers: [InternalCommandGateway],
	exports: [InternalCommandGateway]
})
export class GatewayModule {}
