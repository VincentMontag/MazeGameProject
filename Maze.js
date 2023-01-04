
const Direction = require('./Direction.js');

players = {}

class Player {
	
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dir = Direction.RIGHT;
	}
	
	// Moves the player if it is allowed.
	// dir is a matching string
	move(direction) {
		if (isAllowed(this.x, this.y, direction)) {
			this.dir = direction;
			if (direction.equal(Direction.UP)) this.y--;
			else if (direction.equal(Direction.LEFT)) this.x--;
			else if (direction.equal(Direction.RIGHT)) this.x++;
			else if (direction.equal(Direction.DOWN)) this.y++;
			//if (this.x == Main.WIDTH + 1) console.log("Player reached target");
			return true;
		}
		return false;
	}
	
	// Performes the movement through the whole maze
	autoMove(width) {
		while (true) {
			if (isAllowed(this.x, this.y, this.dir.left())) {
				move(this.dir.left()); 
				this.dir = this.dir.left();
			} else if (isAllowed(this.x, this.y, this.dir)) 
				this.move(this.dir);
			else if (isAllowed(this.x, this.y, this.dir.left().left())) 
				this.dir = this.dir.left().left();
			else 
				this.dir = this.dir.left().left().left();
			if (this.x == 0 && this.y == 1) return false;
			else if (x == width) return true;		
		}
	}
	
}
function addPlayer(id) {
	players[id] = new Player(0, 1);
}

function movePlayer(id, direction) {
	return players[id].move(direction, false);
}

function getX(id) {
	return players[id].x;
}

function getY(id) {
	return players[id].y;
}

let maze = [];
let w = 0;
let h = 0;

function generateMaze(width, height) {
	w = width;
	h = height;
	let solvable = false;
	for (i = 0; i < height + 2; i++)
		maze[i] = [];
	do {
		fillRandomly(width, height);	
		buildFrame(width, height);
		buildEntry();
		buildExit(width, height);
		tester = new Player(0, 1, null);
		solvable = tester.autoMove(width+1);
	} while (!solvable);
	return maze;
}

module.exports = { addPlayer, movePlayer, getX, getY, generateMaze };

//===============================================================================
// Methods for creating the maze
//===============================================================================

function fillRandomly(width, height) {
	for (i = 1; i <= height; i++) {
		for (k = 1; k <= width; k++) {
			maze[i][k] = (1 << Math.floor(Math.random() * 4));
		}
	}
}

function buildFrame(width, height) {		
	for (y = 1; y <= height; y++) { // Right line
		maze[y][width + 1] = 0b100;
	}
	for (x = 1; x <= width; x++) { // Upper line
		maze[0][x] = 0b1000;
	}
	for (y = 1; y <= height; y++) { // Left line
		maze[y][0] = 0b1;
	}
	for (x = 1; x <= width; x++) { // Lower line
		maze[height + 1][x] = 0b10;
	}
}
	
function buildEntry() {
	maze[0][0] = 0b1000;
	maze[1][0] = 0b1000;
	possible = [0b1000, 0b0010, 0b0001];
	maze[1][1] = possible[Math.floor(3 * Math.random())];
}
	
function buildExit(width, height) {
	maze[height][width + 1] = 0b10;
	maze[height + 1][width + 1] = 0b10;
	maze[height][width] = 2 << Math.floor(Math.random() * 3);
}

//===============================================================================
//===============================================================================
//===============================================================================

/*
Proves if you can move into the given direction startet at x, y.
hintedMaze = true if this step should be performed on the hinted maze
*/
function isAllowed(x, y, direction) {
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
function hasWall(x, y, d) {
	if (x < 0 || y < 0 || x > w || y > h) return true;
	return ((maze[y][x] >> d.num) & 0b1) == 1; 
}
