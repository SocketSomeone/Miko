import { Permission, Target, Activator } from '../../../Misc/Models/Permisson';
import { TranslateFunc } from '../../../Framework/Commands/Command';

export default (t: TranslateFunc, v: Permission, i: number) => {
	let activator;
	let target;

	switch (v.target.type) {
		case Target.AllModules:
			target = t('perms.allModules');
			break;

		case Target.Module:
			target = t('perms.module', {
				module: v.target.id
			});
			break;

		case Target.Command:
			target = t('perms.command', {
				cmd: v.target.id
			});
			break;
	}

	switch (v.activator.type) {
		case Activator.Channel:
			activator = `<#${v.activator.id}>`;
			break;

		case Activator.Role || Activator.Server:
			activator = `<@&${v.activator.id}>`;
			break;

		case Activator.User:
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
