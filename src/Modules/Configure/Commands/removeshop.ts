import { Command, Context } from "../../../Framework/Commands/Command";
import { BaseClient } from "../../../Client";
import { NumberResolver } from "../../../Framework/Resolvers";
import { CommandGroup } from "../../../Misc/Models/CommandGroup";
import { Message } from "eris";
import { GuildPermission } from "../../../Misc/Models/GuildPermissions";
import { BaseShopRole } from "../../../Entity/ShopRole";
import { ExecuteError } from "../../../Framework/Errors/ExecuteError";
import { Color } from "../../../Misc/Enums/Colors";

export default class extends Command {
  public constructor(client: BaseClient) {
    super(client, {
      name: "removeshop",
      aliases: [],
      args: [
        {
          name: "index",
          resolver: NumberResolver,
          required: true,
        },
      ],
      group: CommandGroup.CONFIGURE,
      guildOnly: true,
      premiumOnly: false,
      botPermissions: [GuildPermission.MANAGE_ROLES],
      userPermissions: [
        GuildPermission.MANAGE_GUILD,
        GuildPermission.MANAGE_ROLES,
      ],
      examples: ["1"],
    });
  }

  public async execute(
    message: Message,
    [index]: [number],
    { funcs: { t, e }, guild, settings }: Context
  ) {
    const roles = await this.client.cache.shop.get(guild);
    const role = roles[index - 1];

    if (roles.length < 1 || !role)
      throw new ExecuteError(t("configure.removeshop.notFound"));

    role.remove().catch(() => undefined);

    this.client.cache.shop.flush(guild.id);

    await this.replyAsync(message, {
      color: Color.MAGENTA,
      title: t("configure.title"),
      description: t("configure.removeshop.deleted", {
        role: `<@&${role.id}>`,
      }),
      footer: null,
      timestamp: null,
    });
  }
}
