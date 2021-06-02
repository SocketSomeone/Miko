import { Client } from '@miko/framework';
import { container } from 'tsyringe';

import './gateway';
import './modules';

container.resolve(Client);
