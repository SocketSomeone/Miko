import { VuexModule, Module } from 'nuxt-property-decorator';

@Module({
	name: 'guilds',
	namespaced: true,
	stateFactory: true,
	preserveState: true
})
export default class Guilds extends VuexModule {}
