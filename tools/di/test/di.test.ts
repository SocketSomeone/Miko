/* eslint-disable max-classes-per-file */
/* eslint-disable no-useless-constructor */
import { Autowired, Service } from '../src';

describe('DI Service', (): void => {
    it('should inject to property', (): void => {
        @Service()
        class Foo { }

        class Bar {
            @Autowired()
            fooService!: Foo;
        }

        const inst = new Bar();

        expect(inst.fooService).toBeInstanceOf(Foo);
    });

    it('should inject into constructor', () => {
        class Foo { }

        @Service()
        class Bar {
            constructor(
                public readonly fooService: Foo
            ) { }
        }

        class Bazz {
            @Autowired()
            public bar!: Bar;
        }

        const inst = new Bazz();

        expect(inst.bar).not.toBeNull();
        expect(inst.bar.fooService).toBeInstanceOf(Foo);
    });
});