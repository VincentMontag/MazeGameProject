const Direction = require('./Direction.js');

class Player {
	
	static mi;
	
	static setMazeInteraction(mi) {
		Player.mi = mi;
	}
	
	constructor(x, y, name, id) {
		this.x = x;
		this.y = y;
		this.dir = Direction.RIGHT;
		this.stepsNeeded = 0;
		this.done = false;
		this.name = name;
		this.id = id;
		this.wait = false;
	}
	
	// Moves the player if it is allowed.
	// dir is a matching string
	move(direction) {
		if (!this.wait && !this.done && Player.mi.isAllowed(this.x, this.y, direction)) {
			this.dir = direction;
			if (direction.equal(Direction.UP)) this.y--;
			else if (direction.equal(Direction.LEFT)) this.x--;
			else if (direction.equal(Direction.RIGHT)) this.x++;
			else if (direction.equal(Direction.DOWN)) this.y++;
			if (this.x == Player.mi.maze[0].length) {
				let key = {
					username: this.name,
					time: Date.now()
				}
				this.done = true;
				const m = require('./Maze.js');
				this.highscore = {
					steps: this.stepsNeeded, 
					score: Math.floor(m.getShortestDistance() / this.stepsNeeded * 100)
				};
				m.setHighscore(JSON.stringify(key), this.highscore);
			}
			this.stepsNeeded++;
			return true;
		}
		return false;
	}
	
}

module.exports = Player;
