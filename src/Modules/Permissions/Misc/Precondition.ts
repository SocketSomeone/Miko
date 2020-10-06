import { Activator, Target, Permission } from '../../../Misc/Models/Permisson';
import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';

interface Precondtion {
	context: Context;
	command: BaseCommand;
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
		{ command: { name, module }, message: { member, channel } }: Precondtion
	): boolean | null {
		if (
			!(
				(permission.target.type === Target.Command &&
					String(permission.target.id).toLowerCase() === name.toLowerCase()) ||
				(permission.target.type === Target.Module &&
					permission.target.id.toLowerCase() === module.names.en.toLowerCase()) ||
				(permission.target.type === Target.AllModules && permission.target.id === '*')
			)
		)
			return null;

		switch (permission.activator.type) {
			case Activator.User:
				if (permission.activator.id === member.id) return permission.allow;
				break;

			case Activator.Channel:
				if (permission.activator.id === channel.id) return permission.allow;
				break;

			case Activator.Role:
				if (!member) break;

				if (member.roles.includes(permission.activator.id)) return permission.allow;

				break;

			case Activator.Server:
				if (!member) break;

				return permission.allow;
		}

		return null;
	}
}
