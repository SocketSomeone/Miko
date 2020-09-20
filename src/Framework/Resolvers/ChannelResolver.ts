import { Channel } from 'eris';

import { Context } from '../commands/Command';

import { Resolver } from './Resolver';
import { BaseClient } from '../../Client';
import { ChannelType } from '../../Types';

const channelRegex = /^(?:<#)?(\d+)>?$/;

export class ChannelResolver extends Resolver {
	private type: ChannelType;

	public constructor(client: BaseClient, type?: ChannelType) {
		super(client);

		this.type = type;
	}

	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<Channel> {
		if (!guild || !value) {
			return;
		}

		let channel: Channel;

		if (channelRegex.test(value)) {
			const id = value.match(channelRegex)[1];
			channel = guild.channels.get(id);

			if (!channel) {
				throw Error(t(`resolvers.channel.notFound`));
			}
		} else {
			const name = value.toLowerCase();
			const channels = guild.channels.filter((r) => {
				const rName = r.name.toLowerCase();
				return rName.includes(name) || name.includes(rName);
			});

			if (channels.length === 1) {
				channel = channels[0];
			} else {
				throw Error(t(`resolvers.channel.notFound`));
			}
		}

		if (this.type && channel.type !== this.type) {
			throw Error(t(`resolvers.channel.type`));
		}

		return channel;
	}
}
