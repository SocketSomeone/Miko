import * as apps from './apps';
import { common } from './CommonConfig';
import { scripts } from './ScriptsConfig';

export const config = {
	...common,
	...apps,
	...scripts
};
