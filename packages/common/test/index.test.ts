import { container } from 'tsyringe';
import { MiClient } from '../src/client';

test('Resolve Client in Container', () => {
	expect(container.resolve(MiClient)).not.toBeNull();
});
