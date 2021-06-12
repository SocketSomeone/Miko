import { namespace } from 'nuxt-property-decorator';
import type { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

const stores = {
	AuthStore: namespace('auth')
};

function initializeStores(store: Store<unknown>): void {
	// exampleStore = getModule(example, store);
}

export { initializeStores, stores };
