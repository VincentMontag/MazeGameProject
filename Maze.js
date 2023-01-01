
const Direction = require('./Direction.js');

const SCALE = 10;

players = {}

class Player {
	
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dir = Direction.RIGHT;
	}
	
	// Performes the movement through the whole maze
	// time = x, where x is the delay in each single move
	autoMove(time) {
		//TODO Timer instead of while(true)
		while (true) {
			if (isAllowed(this.x, this.y, this.dir.left())) {
				move(this.dir.left(), hintedMaze); 
				this.dir = this.dir.left();
			} else if (isAllowed(this.x, this.y, this.dir)) 
				move(this.dir, hintedMaze);
			else if (isAllowed(this.x, this.y, this.dir.left().left())) 
				this.dir = this.dir.left().left();
			else 
				this.dir = this.dir.left().left().left();
			//if (time > 0) Thread.sleep(time);
			if (this.x == 0 && this.y == 1) return false;
			//else if (x == Main.WIDTH + 1) return true;		
		}
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
	
}
function addPlayer(id) {
	players[id] = new Player(0, 1);
}

function movePlayer(id, direction) {
	return players[id].move(direction, false);
}

function getX(id) {
	return players[id].x * SCALE;
}

function getY(id) {
	return players[id].y * SCALE;
}

module.exports = { addPlayer, movePlayer, getX, getY };

// Box width 1500
const bw = 1500;

// Box height 750
const bh = 750;

// Context
const mazegame = null;//document.getElementById("MazeGame");
const mazegame2d = null;//mazegame.getContext("2d");
		
// Modes
const hardMode = 20;
const mediumMode = 40;
const easyMode = 76;

let mode = hardMode;

let width = bw / mode - 1;
let height = bh / mode - 1;

// Maze
let maze = [];

function generateMaze() {
	let solvable = false;
	for (i = 0; i < bh / mode; i++)
		maze[i] = [];
	do {
		fillRandomly();	
		buildFrame();
		buildEntry();
		buildExit();
		tester = new Player(0, 1, null);
		solvable = tester.autoMove(0);
	} while (!solvable);
	activateNewMaze(5);
}

function activateNewMaze(counter) {
	counter = counter - 1;
	if (counter != 0) {
		setTimeout(activateNewMaze, 500, counter);
		hintPhase = !hintPhase;
	} else {
		hintPhase = false;
		hintedToNewMaze();
	} 
	drawMaze();
}



//===============================================================================
// Methods for creating the maze
//===============================================================================

function hintedToNewMaze() {
	for (y = 0; y < bh / mode; y++) {
		maze[y] = [];
		for (x = 0; x < bw / mode; x++) {
			maze[y][x] = hintedMaze[y][x];
		}
	}
}

function fillRandomly() {
	for (i = 1; i <= height; i++) {
		for (k = 1; k <= width; k++) {
			hintedMaze[i][k] = 1 << Math.floor(Math.random() * 4);
		}
	}
}

function buildFrame() {		
	for (y = 1; y <= height; y++) { // Right line
		hintedMaze[y][width + 1] = 0b100;
	}
	for (x = 1; x <= width; x++) { // Upper line
		hintedMaze[0][x] = 0b1000;
	}
	for (y = 1; y <= height; y++) { // Left line
		hintedMaze[y][0] = 0b1;
	}
	for (x = 1; x <= width; x++) { // Lower line
		hintedMaze[height + 1][x] = 0b10;
	}
}
	
function buildEntry() {
	hintedMaze[0][0] = 0b1000;
	hintedMaze[1][0] = 0b1000;
	possible = [0b1000, 0b0010, 0b0001];
	hintedMaze[1][1] = possible[Math.floor(3 * Math.random())];
}
	
function buildExit() {
	hintedMaze[height][width + 1] = 0b10;
	hintedMaze[height + 1][width + 1] = 0b10;
	hintedMaze[height][width] = 2 << Math.floor(Math.random() * 3);
}

//===============================================================================
//===============================================================================
//===============================================================================

/*
Proves if you can move into the given direction startet at x, y.
hintedMaze = true if this step should be performed on the hinted maze
*/
function isAllowed(x, y, direction, hintedMaze) {
	if (direction.equal(Direction.RIGHT) &&
		(hasWall(x, y, Direction.RIGHT, hintedMaze) || hasWall(x + 1, y, Direction.LEFT, hintedMaze))) 
			return false;
	if (direction.equal(Direction.UP) && 
		(hasWall(x, y, Direction.UP, hintedMaze) || hasWall(x, y - 1, Direction.DOWN, hintedMaze)))
			return false;
	if (direction.equal(Direction.LEFT) &&
		(hasWall(x, y, Direction.LEFT, hintedMaze) || hasWall(x - 1, y, Direction.RIGHT, hintedMaze)))
			return false;
	if (direction.equal(Direction.DOWN) &&
		(hasWall(x, y, Direction.DOWN, hintedMaze) || hasWall(x, y + 1, Direction.UP, hintedMaze)) )
			return false;
	return true;
}

/*
Checks if there is a wall at (x, y) in direction d. 
hinted = true if the check should be proceeded on the hinted maze
*/	
function hasWall(x, y, d, hinted) {
	return false;
	if (x < 0 || y < 0 || x > Main.WIDTH + 1 || y > Main.HEIGHT + 1) return true;
	return (((hinted ? hintedMaze[y][x] : maze[y][x]) >> d.num) & 0b1) == 1; 
}

/*
Draws the maze once.
When drawing again, the screen has to be cleaned.
*/

function drawMaze(){
	
	    
	    // drawing code here:	
	    // Choose color to draw with
	    // rgba (red, green, blue, alpha [= transparency])
	    // mazegame2d.fillStyle = "rgb(0, 0, 0)";
	    // fillRect(x, y, width, height) draws filled rectangle
	 	// strokeRect(x, y, width, height) draws rectangular outline
	 	// clearRect(x, y, width, height) clears specified arie and makes it transparent
	   	//-------------------------------------------------
	    // path = draw points, connect them and fill them to any shape yoou want
	    // moveTo(x,y) = initial point
	    // lineTo(x,y) = draw line to somewhere
	    // fill() = fills everything inside the lines
	    //-------------------------------------------------
	    // new Path2D(); empty path obj
	    // new Path2D(path); copy from another Path2D obj
	    // Path2d(d); path from SVG path data
	    //-------------------------------------------------
	    // Grid:
		mazegame2d.fillStyle = "rgb(0, 0, 0)";
	
		for (y = 0; y < bh / mode; y++) {
			for (x = 0; x < bw / mode; x++) {
				if ((maze[y][x] & 0b1) == 1) // right vertical line
					mazegame2d.fillRect(
						mode * (x + 3.0 / 4), 
						mode * (y - 1.0 / 4), 
						mode * 0.5, 
						mode * 1.5);
				else if (((maze[y][x] >> 1) & 0b1) == 1) // upper horizontal line
					mazegame2d.fillRect(
						mode * (x - 1.0 / 4),
						mode * (y - 1.0 / 4),
						mode * 1.5,
						mode * 0.5);
				else if (((maze[y][x] >> 2) & 0b1) == 1) // left vertical line
					mazegame2d.fillRect(
						mode * (x - 1.0 / 4),
						mode * (y - 1.0 / 4),
						mode * 0.5,
						mode * 1.5);
				else if (((maze[y][x] >> 3) & 0b1) == 1) // lower horizontal line
					mazegame2d.fillRect(
						mode * (x - 1.0 / 4),
						mode * (y + 3.0 / 4),
						mode * 1.5,
						mode * 0.5);
			}
		}
		mazegame2d.stroke();
		
		    
}
