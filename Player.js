const Direction = require('./Direction.js');

const MazeInteraction = require('./MazeInteraction.js');

class Player {
	
	static MazeInteraction mi;
	
	constructor(x, y, name) {
		this.x = x;
		this.y = y;
		this.dir = Direction.RIGHT;
		this.stepsNeeded = 0;
		this.done = false;
		this.name = name;
	}
	
	// Moves the player if it is allowed.
	// dir is a matching string
	move(direction) {
		if (!this.done && mi.isAllowed(this.x, this.y, direction)) {
			this.dir = direction;
			if (direction.equal(Direction.UP)) this.y--;
			else if (direction.equal(Direction.LEFT)) this.x--;
			else if (direction.equal(Direction.RIGHT)) this.x++;
			else if (direction.equal(Direction.DOWN)) this.y++;
			if (this.x == w + 1) {
				let key = {
					username: this.name,
					time: Date.now()
				}
				this.done = true;
				const maze = require('./Maze.js');
				maze.setHighscore(JSON.stringify(key), {
					steps: this.stepsNeeded, 
					score: Math.floor(maze.shortestPath / this.stepsNeeded * 100)
				});
			}
			this.stepsNeeded++;
			return true;
		}
		return false;
	}
	
}

module.exports = Player;
