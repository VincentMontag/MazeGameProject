// Box width 1520
const bw = 1320;

// Box height 760
const bh = 660;

// Padding
const p = 0;

// Context
const mazegame = document.getElementById("MazeGame");
const mazegame2d = mazegame.getContext("2d");
		
// Modes
const hardMode = 20;
const mediumMode = 40;
const easyMode = 76;

let mode = hardMode;

let width = bw / mode - 1;
let height = bh / mode - 1;

// Maze
let hintedMaze = [];
let maze = [];

let hintPhase = false;

function generateMaze() {
	let solvable = false;
	for (i = 0; i < bh / mode; i++)
		hintedMaze[i] = [];
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

class Player {
	 // current direction
	direction = Direction.RIGHT;
	
	constructor(x, y, image) {
		this.x = x;
		this.y = y;
		this.image = image;
	}
	
	// Performes the movement through the whole maze
	// hintedMaze = true if the movement should be performed in the hinted maze
	// time = x, where x is the delay in each single move
	autoMove(time, hintedMaze) {
		current = Direction.RIGHT;
		while (true) {
			if (isAllowed(x, y, current.left(), hintedMaze)) {
				move(current.left(), hintedMaze); 
				current = current.left();
			} else if (isAllowed(x, y, current, hintedMaze)) 
				move(current, hintedMaze);
			else if (isAllowed(x, y, current.left().left(), hintedMaze)) 
				current = current.left().left();
			else 
				current = current.left().left().left();
			//if (time > 0) Thread.sleep(time);
			if (x == 0 && y == 1) return false;
			else if (x == Main.WIDTH + 1) return true;		
		}
	}
	
	// Moves the player if it is allowed.
	// dir is a matching string
	// hintedMaze = true, if the move should be performed in the hintedMaze
	move(dir, hintedMaze) {
		if (isAllowed(x, y, dir, hintedMaze)) {
			direction = dir;
			if (direction.equal("UP")) y--;
			else if (direction.equal("LEFT")) x--;
			else if (direction.equal("RIGHT")) x++;
			else if (direction.equal("DOWN")) y++;
		}
		if (x == Main.WIDTH + 1) console.log("Player reached target");
		if (!hintedMaze) draw(context);
	}
	
	draw(context) {
		let storedTransform = context.getTransform();
		context.translate(mode * (x + 0.5), mode * (y + 0.5));
		if (curDir.equal("RIGHT")) context.rotate(- Math.PI / 2);
		else if (curDir.equal("UP")) context.rotate(- Math.PI / 2);
		else if (curDir.equal("LEFT")) context.rotate(- Math.PI / 2);	
		var image = new Image();
		image.onload = function () {
			context.drawImage(image, - mode / 2, - mode / 2);
    	};
    	image.src = 'pixelart/player_blue.png';
		context.setTransform(storedTransform);
	}
	
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
	if (direction.equal("RIGHT") &&
		(hasWall(x, y, Direction.RIGHT, hintedMaze) || hasWall(x + 1, y, Direction.LEFT, hintedMaze))) 
			return false;
	if (direction.equal("UP") && 
		(hasWall(x, y, Direction.UP, hintedMaze) || hasWall(x, y - 1, Direction.DOWN, hintedMaze)))
			return false;
	if (direction.equal("LEFT") &&
		(hasWall(x, y, Direction.LEFT, hintedMaze) || hasWall(x - 1, y, Direction.RIGHT, hintedMaze)))
			return false;
	if (direction.equal("DOWN") &&
		(hasWall(x, y, Direction.DOWN, hintedMaze) || hasWall(x, y + 1, Direction.UP, hintedMaze)) )
			return false;
	return true;
}

/*
Checks if there is a wall at (x, y) in direction d. 
hinted = true if the check should be proceeded on the hinted maze
*/	
function hasWall(x, y, d, hinted) {
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
