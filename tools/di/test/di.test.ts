/* eslint-disable max-classes-per-file */
import { Autowired } from '../src';

describe('DI Service', (): void => {
    it('should inject s2s', (): void => {
        class Foo { }

        class Bar {
            @Autowired()
            fooService!: Foo;
        }

        expect(new Bar().fooService).toBeInstanceOf(Foo);
    });
});