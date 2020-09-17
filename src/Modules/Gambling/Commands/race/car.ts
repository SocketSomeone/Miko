import { Member } from 'eris';
import { Point2D } from './interface/point';

export class Car extends Point2D {
	public model: string;
	public affect: number = 0;

	public place: number = null;
	public finishedAt: number = null;

	public member: Member;
	public isBot: boolean;

	constructor(x: number, y: number, member: Member, model: string) {
		super(x, y);

		this.model = model;
		this.member = member;
		this.isBot = !member;
	}

	public toString() {
		return this.model;
	}
}
