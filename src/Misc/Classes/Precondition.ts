import { PermissionsFrom, PermissionsExecute, Permission } from '../Models/Permisson';
import { Context, Command } from '../../Framework/Commands/Command';
import { Message } from 'eris';

interface Precondtion {
	context: Context;
	command: Command;
	message: Message;
}

export class Precondition {
	public static checkPermissions(context: Precondtion, permissions: Permission[]) {
		let i = permissions.length;

		for (const permission of permissions) {
			const bResult = this.checkPermission(permission, context);
			console.log(bResult);
			if (bResult === null) {
				i--;
				continue;
			}

			return { answer: bResult, permission };
		}

		return { answer: true, permission: null };
	}

	private static checkPermission(permission: Permission, context: Precondtion): boolean | null {
		const {
			command: { name, group },
			message: { member, channel }
		} = context;

		if (
			!(
				(permission.target === PermissionsExecute.Command &&
					permission.targetId.toLowerCase() === name.toLowerCase()) ||
				(permission.target === PermissionsExecute.Module &&
					permission.targetId.toLowerCase() === group.toString().toLowerCase()) ||
				(permission.target === PermissionsExecute.AllModules && permission.targetId === '*')
			)
		)
			return null;

		switch (permission.activator) {
			case PermissionsFrom.User:
				if (permission.activatorId === member.id) return permission.value;
				break;

			case PermissionsFrom.Channel:
				if (permission.activatorId === channel.id) return permission.value;
				break;

			case PermissionsFrom.Role:
				if (!member) break;

				if (member.roles.includes(permission.activatorId)) return permission.value;

				break;

			case PermissionsFrom.Server:
				if (!member) break;

				return permission.value;
		}

		return null;
	}
}
