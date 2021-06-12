/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import { Store } from 'vuex';
import { initializeStores } from '~/utils/store-accessor';

export function createStore(): Store<unknown> {
	return new Store({
		modules: {
			Guilds
		}
	});
}

const initializer = (store: Store<unknown>): void => initializeStores(store);

export const plugins = [initializer];

export * from '~/utils/store-accessor';
