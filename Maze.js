
const Direction = require('./Direction.js');

const Player = require('./Player.js');

const Queue = require('./Queue.js');

let players = {};

let solPath = [];

let maze = [];
let w = 0;
let h = 0;

function addPlayer(id, name) {
	players[id] = new Player(0, 1, name);
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

function generateMaze(width, height, setHighscore) {
	w = width;
	h = height;
	for (i = 0; i < height + 2; i++)
		maze[i] = [];
	do {
		fillRandomly(width, height);	
		buildFrame(width, height);
		buildEntry();
		buildExit(width, height);
		checkSolvable(setHighscore);
	} while (Player.shortestPath == -1);
	return maze;
}

function getHighscores() {
	return Player.highscores;
}

function shortestPathLength(directions, setHighscore) {
	let pos = {x: w+1, y: h};
	while (pos.x != 0) {
		Player.shortestPath++;
		solPath.push(pos);
		pos = directions[pos.y][pos.x].getCoordinates(pos.x, pos.y);
	}
	// set highscore
	if (setHighscore) {
		let key = {
			username: "Irrgartenkönig",
			time: Date.now()
		}
		Player.highscores[JSON.stringify(key)] = {
			steps: Player.shortestPath, 
			score: 100
		};
	}	
}

function checkSolvable(setHighscore) {
	let directions = [];
	for (i = 0; i < maze.length; i++) directions[i] = [];
	Queue.offer({x: 0, y: 1, dir: Direction.RIGHT});
	while (!Queue.empty()) {
		let u = Queue.poll();
		if (u.x == w+1) {
			shortestPathLength(directions, setHighscore);
			break;
		}
		let nDirections = [u.dir.left().left().left(), u.dir, u.dir.left()];
		for (d of nDirections) {
			if (isAllowed(u.x, u.y, d)) {
				let n = d.getCoordinates(u.x, u.y);
				if (directions[n.y][n.x] === undefined) {
					directions[n.y][n.x] = d.left().left();
					Queue.offer({x: n.x, y: n.y, dir: d});
				}			
			}
		}
	}
}

function getShortestPath() {
	return shortestPath;
}

function getSolution() {
	return solPath;
}

module.exports = { addPlayer, movePlayer, getX, getY, generateMaze, getHighscores, getShortestPath, getSolution };

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
	if (x < 0 || y < 0 || x > w + 1 || y > h + 1) return true;
	return ((maze[y][x] >> d.num) & 0b1) == 1; 
}
