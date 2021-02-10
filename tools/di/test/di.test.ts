/* eslint-disable max-classes-per-file */
/* eslint-disable no-useless-constructor */
import { Autowired, Injectable } from '../src';

describe('DI Service', (): void => {
    it('should inject to property', (): void => {
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

        @Injectable()
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