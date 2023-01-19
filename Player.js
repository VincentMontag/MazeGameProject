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
		this.bonus = 0;
	}
	
	// Moves the player if it is allowed.
	// dir is a matching string
	move(direction) {
		if (!this.wait && !this.done && 
				(Player.mi.isAllowed(this.x, this.y, direction) || this.bonus > 0)) {
			this.dir = direction;
			this.bonus--;
			this.oldX = this.x;
			this.oldY = this.y;
			if (direction.equal(Direction.UP)) this.y--;
			else if (direction.equal(Direction.LEFT)) this.x--;
			else if (direction.equal(Direction.RIGHT)) this.x++;
			else if (direction.equal(Direction.DOWN)) this.y++;
			if (Player.mi.outOfMaze(this.x, this.y)) {
				this.x = this.oldX;
				this.y = this.oldY;
			}
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
