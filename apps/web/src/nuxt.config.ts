// Import base config
import build from './config/build';
import buildModules from './config/buildModules';
import constants from './config/constants';
import head from './config/head';
import modules from './config/modules';
import plugins from './config/plugins';
import server from './config/server';

import * as configs from './config/modules/index';

const config = {
	...constants,

	...configs,

	build,

	buildModules,

	head,

	plugins,

	server,

	modules
};

export default config;
