import type { CommandsGetDTO } from '@miko/common';
import { AutoWired, GatewayService } from '@miko/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommandsService {
	@AutoWired()
	private gatewayService: GatewayService;

	public async findAll(): Promise<CommandsGetDTO> {
		return this.gatewayService.emit<CommandsGetDTO>('COMMANDS_GET');
	}
}
