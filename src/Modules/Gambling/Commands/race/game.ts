import { Member } from 'eris';
import { clearInterval } from 'timers';
import { EventEmitter } from 'typeorm/platform/PlatformTools';
import { chance } from '../../../../Misc/Utils/Chance';
import { Affect } from './affects';
import { Car } from './car';

const EMOJI_CARS = ['🚗', '🛒', '🚙', '🚓'];

export class Game extends EventEmitter {
	private width: number = 18;
	private height: number = 6;
	public maxPlayers: number = EMOJI_CARS.length;

	private grid: string[][] = [];

	public players: Set<string> = new Set();
	public cars: Car[] = [];

	private affects: Affect[] = [];

	private timer: NodeJS.Timeout;
	public started: boolean = false;

	private rotate: number = 0;
	private nextPlace = 1;

	public constructor(...players: Member[]) {
		super();

		for (let x = 0; x < this.width; x++) {
			this.grid[x] = [];
		}

		players.map((x) => this.addPlayer(x));
		this.generateAffects();
	}

	public init() {
		this.emit('init');
	}

	private updateGrid() {
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				this.grid[x][y] = '\u200b ';

				if (y === 0 || y === this.height - 1) {
					if (x === 0) {
						this.grid[x][y] = '🏁';
					} else {
						this.grid[x][y] = '-';
					}
				}
			}
		}

		for (const affect of this.affects) {
			this.grid[affect.x][affect.y] = affect.toString();
		}

		for (const car of this.cars) {
			this.grid[car.x < 0 ? 0 : car.x][car.y] = car.toString();
		}
	}

	private generateAffects() {
		for (let y = 1; y < this.height - 1; y++) {
			for (let i = 0; i < this.randomInt(0, 3); i++) {
				const x = this.randomInt(4, this.width - 3);
				const aff = new Affect(x, y);

				this.affects.push(aff);
			}
		}
	}

	private tick() {
		for (const car of this.cars) {
			car.x -= this.randomInt(1, 4) - car.affect;
			car.affect = 0;

			if (car.x <= 0) {
				if (car.place === null) {
					car.place = this.nextPlace;
					car.finishedAt = this.rotate;

					if (this.nextPlace === 1 && !car.isBot) {
						this.emit('winner', car.member);
					}

					this.nextPlace++;
				}

				car.x = 0;
				continue;
			}

			for (const affect of this.affects) {
				if (affect.x !== car.x || affect.y !== car.y) continue;

				car.affect = affect.mult;
			}
		}

		this.rotate++;
		this.emit('tick', this.toString());
	}

	public toString() {
		this.updateGrid();

		let result = '';

		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				result += this.grid[j][i];
			}

			result += '\n';
		}

		return result;
	}

	public async start() {
		this.started = true;

		const spawnBots = (count: number) => {
			if (count === 0) return;

			this.addPlayer(null);
			spawnBots(count - 1);
		};

		spawnBots(this.maxPlayers - this.players.size);

		this.timer = setInterval(() => {
			this.tick();

			if (this.cars.every((c) => c.x === 0)) {
				clearInterval(this.timer);

				this.emit('end', this.cars);
			}
		}, 5000);
	}

	public addPlayer(member: Member) {
		const car = new Car(this.width - 1, this.cars.length + 1, member, EMOJI_CARS[this.cars.length]);

		this.cars = [...this.cars, car];

		if (member) {
			this.players.add(member.id);
			this.emit('gameUpdate');
		}
	}

	protected randomInt(min: number, max: number) {
		return chance.integer({
			min,
			max
		});
	}
}
