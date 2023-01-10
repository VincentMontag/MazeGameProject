const Direction = require('./Direction.js');

class Player {
	
	static highscores = {};
	
	static shortestPath = -1;
	
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
		if (!this.done && isAllowed(this.x, this.y, direction)) {
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
				highscores[JSON.stringify(key)] = {
					steps: this.stepsNeeded, 
					score: Math.floor(shortestPath / this.stepsNeeded * 100)
				};
			}
			this.stepsNeeded++;
			return true;
		}
		return false;
	}
	
}

module.exports = Player;
