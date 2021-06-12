import { VuexModule, Module } from 'nuxt-property-decorator';

@Module({
	name: 'contributors',
	namespaced: true,
	stateFactory: true
})
export default class Contributors extends VuexModule {}
