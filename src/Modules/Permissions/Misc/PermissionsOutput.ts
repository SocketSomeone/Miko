import { Permission, PermissionsExecute, PermissionsFrom } from '../../../Misc/Models/Permisson';
import { TranslateFunc } from '../../../Framework/Commands/Command';

export default (t: TranslateFunc, v: Permission, i: number) => {
	let activator;
	let target;

	switch (v.target.type) {
		case PermissionsExecute.AllModules:
			target = t('perms.allModules');
			break;

		case PermissionsExecute.Module:
			target = t('perms.module', {
				module: v.target.id
			});
			break;

		case PermissionsExecute.Command:
			target = t('perms.command', {
				cmd: v.target.id
			});
			break;
	}

	switch (v.activator.type) {
		case PermissionsFrom.Channel:
			activator = `<#${v.activator.id}>`;
			break;

		case PermissionsFrom.Role || PermissionsFrom.Server:
			activator = `<@&${v.activator.id}>`;
			break;

		case PermissionsFrom.User:
			activator = `<@${v.activator.id}>`;
			break;
	}

	return t('perms.item', {
		index: i + 1,
		allow: t(`perms.${String(v.allow)}`),
		activator,
		target
	});
};
