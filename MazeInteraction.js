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
			(hasWall(x, y, Direction.RIGHT) || hasWall(x + 1, y, Direction.LEFT))) 
				return false;
		if (direction.equal(Direction.UP) && 
			(hasWall(x, y, Direction.UP) || hasWall(x, y - 1, Direction.DOWN)))
				return false;
		if (direction.equal(Direction.LEFT) &&
			(hasWall(x, y, Direction.LEFT) || hasWall(x - 1, y, Direction.RIGHT)))
				return false;
		if (direction.equal(Direction.DOWN) &&
			(hasWall(x, y, Direction.DOWN) || hasWall(x, y + 1, Direction.UP)) )
				return false;
		return true;
	}
	
	/*
	Checks if there is a wall at (x, y) in direction d. 
	hinted = true if the check should be proceeded on the hinted maze
	*/	
	hasWall(x, y, d) {
		if (x < 0 || y < 0 || x > w + 1 || y > h + 1) return true;
		return ((this.maze[y][x] >> d.num) & 0b1) == 1; 
	}
	
}

module.exports = MazeInteraction;
