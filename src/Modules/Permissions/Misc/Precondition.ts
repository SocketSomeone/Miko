import { PermissionsFrom, PermissionsExecute, Permission } from '../../../Misc/Models/Permisson';
import { Context, Command } from '../../../Framework/Services/Commands/Command';
import { Message } from 'eris';
import Enum from '../../../Misc/Utils/Enum';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

interface Precondtion {
	context: Context;
	command: Command;
	message: Message;
}

export class Precondition {
	public static checkPermissions(context: Precondtion, permissions: Permission[]) {
		for (const permission of permissions.sort((a, b) => b.index - a.index)) {
			const bResult = this.checkPermission(permission, context);

			if (bResult === null) {
				continue;
			}

			return { answer: bResult, permission };
		}

		return { answer: true, permission: null };
	}

	private static checkPermission(
		permission: Permission,
		{ command: { name, group }, message: { member, channel } }: Precondtion
	): boolean | null {
		if (
			!(
				(permission.target.type === PermissionsExecute.Command &&
					String(permission.target.id).toLowerCase() === name.toLowerCase()) ||
				(permission.target.type === PermissionsExecute.Module && permission.target.id === group) ||
				(permission.target.type === PermissionsExecute.AllModules && permission.target.id === '*')
			)
		)
			return null;

		switch (permission.activator.type) {
			case PermissionsFrom.User:
				if (permission.activator.id === member.id) return permission.allow;
				break;

			case PermissionsFrom.Channel:
				if (permission.activator.id === channel.id) return permission.allow;
				break;

			case PermissionsFrom.Role:
				if (!member) break;

				if (member.roles.includes(permission.activator.id)) return permission.allow;

				break;

			case PermissionsFrom.Server:
				if (!member) break;

				return permission.allow;
		}

		return null;
	}
}
