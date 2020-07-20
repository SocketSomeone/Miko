'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Permisson_1 = require('../Models/Permisson');
class Precondition {
	static checkPermissions(context, permissions) {
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
	static checkPermission(permission, context) {
		const {
			command: { name, group },
			message: { member, channel }
		} = context;
		if (
			!(
				(permission.target === Permisson_1.PermissionsExecute.Command &&
					permission.targetId.toLowerCase() === name.toLowerCase()) ||
				(permission.target === Permisson_1.PermissionsExecute.Module &&
					permission.targetId.toLowerCase() === group.toString().toLowerCase()) ||
				(permission.target === Permisson_1.PermissionsExecute.AllModules && permission.targetId === '*')
			)
		)
			return null;
		switch (permission.activator) {
			case Permisson_1.PermissionsFrom.User:
				if (permission.activatorId === member.id) return permission.value;
				break;
			case Permisson_1.PermissionsFrom.Channel:
				if (permission.activatorId === channel.id) return permission.value;
				break;
			case Permisson_1.PermissionsFrom.Role:
				if (!member) break;
				if (member.roles.includes(permission.activatorId)) return permission.value;
				break;
			case Permisson_1.PermissionsFrom.Server:
				if (!member) break;
				return permission.value;
		}
		return null;
	}
}
exports.Precondition = Precondition;
//# sourceMappingURL=Precondition.js.map
