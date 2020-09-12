import { Command, Context } from "../../../Framework/Commands/Command";
import { BaseClient } from "../../../Client";
import { CommandGroup } from "../../../Misc/Models/CommandGroup";
import { Message } from "eris";
import { ExecuteError } from "../../../Framework/Errors/ExecuteError";
import { NumberResolver } from "../../../Framework/Resolvers";
import { Images } from "../../../Misc/Enums/Images";

const ROLE_PER_PAGE = 8;

export default class extends Command {
  public constructor(client: BaseClient) {
    super(client, {
      name: "shop",
      aliases: ["магазин", "шоп", "магаз", "items"],
      args: [
        {
          name: "page",
          resolver: NumberResolver,
          required: false,
        },
      ],
      group: CommandGroup.ECONOMY,
      guildOnly: true,
      premiumOnly: false,
    });
  }

  public async execute(
    message: Message,
    [offset]: [number],
    { funcs: { t, e }, guild, settings }: Context
  ) {
    const items = await this.client.cache.shop.get(guild);

    if (items.length < 1) {
      throw new ExecuteError(t("economy.shop.empty"));
    }

    const maxPage = Math.ceil(items.length / ROLE_PER_PAGE);
    const startPage = Math.max(
      Math.min(offset ? offset - 1 : 0, maxPage - 1),
      0
    );

    await this.showPaginated(message, startPage, maxPage, (page) => {
      const roles = items.slice(
        page * ROLE_PER_PAGE,
        (page + 1) * ROLE_PER_PAGE
      );
      const fields: { name: string; value: string; inline: boolean }[] = [];

      roles.map((role, i) => {
        fields.push(
          {
            name: t("economy.shop.fields.index"),
            value: `${i + (page - 1) * ROLE_PER_PAGE + 1}.`,
            inline: true,
          },
          {
            name: t("economy.shop.fields.role"),
            value: `<@&${role.id}>`,
            inline: true,
          },
          {
            name: t("economy.shop.fields.cost"),
            value: message.member.roles.includes(role.id)
              ? t("economy.shop.bought")
              : `${role.cost} ${e(settings.currency)}`,
            inline: true,
          }
        );
      });

      return this.createEmbed({
        author: {
          name: t("economy.shop.title", { guild: guild.name }),
          icon_url: Images.SHOP,
        },
        fields,
        footer: null,
      });
    });
  }
}
