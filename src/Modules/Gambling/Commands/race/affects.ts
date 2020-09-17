import { Point2D } from './interface/point';

export class Affect extends Point2D {
	public mult: number = [-1, 2].random();

	public toString() {
		return this.mult > 0 ? '🚫' : '⚡';
	}
}
