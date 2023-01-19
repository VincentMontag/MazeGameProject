const Direction = require('./Direction.js');

class MazeInteraction {
	
	constructor(maze) {
		this.maze = maze;
	}
	
	/*
	Proves if you can move into the given direction startet at x, y.
	hintedMaze = true if this step should be performed on the hinted maze
	*/
	isAllowed(x, y, direction) {
		if (direction.equal(Direction.RIGHT) &&
			(this.hasWall(x, y, Direction.RIGHT) || this.hasWall(x + 1, y, Direction.LEFT))) 
				return false;
		if (direction.equal(Direction.UP) && 
			(this.hasWall(x, y, Direction.UP) || this.hasWall(x, y - 1, Direction.DOWN)))
				return false;
		if (direction.equal(Direction.LEFT) &&
			(this.hasWall(x, y, Direction.LEFT) || this.hasWall(x - 1, y, Direction.RIGHT)))
				return false;
		if (direction.equal(Direction.DOWN) &&
			(this.hasWall(x, y, Direction.DOWN) || this.hasWall(x, y + 1, Direction.UP)) )
				return false;
		return true;
	}
	
	/*
	Checks if there is a wall at (x, y) in direction d. 
	hinted = true if the check should be proceeded on the hinted maze
	*/	
	hasWall(x, y, d) {
		return ((this.maze[y][x] >> d.num) & 0b1) == 1; 
	}
	
	outOfMaze(x, y) {
		return !(x == 0 && y == 1) && !(x == this.maze[0].length && y == this.maze.length - 2) && 
			(x < 1 || y < 1 || x > this.maze[0].length - 1 || y > this.maze.length - 2);
	}
	
}

module.exports = MazeInteraction;
