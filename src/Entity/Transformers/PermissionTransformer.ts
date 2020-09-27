import { ValueTransformer } from 'typeorm';
import { Permission } from '../../Misc/Models/Permisson';

export const PermissionTransformer: ValueTransformer = {
	from: (arr: Permission[]) => normalizePermissions(arr),
	to: (arr: Permission[]) => normalizePermissions(arr)
};

function normalizePermissions(arr: Permission[]) {
	return arr
		.sort((a, b) => a.index - b.index)
		.map((v, i) => {
			v.index = i + 1;
			return v;
		});
}
