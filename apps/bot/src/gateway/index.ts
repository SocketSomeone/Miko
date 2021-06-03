import type { InjectionToken } from 'tsyringe';
import { container } from 'tsyringe';
import { CommandsGet } from './CommandsGet';
import { GuildInfo } from './GuildInfo';

const listeners = [GuildInfo, CommandsGet];

listeners.forEach((v: InjectionToken<unknown>) => container.resolve(v));
