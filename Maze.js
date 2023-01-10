
const Direction = require('./Direction.js');

const Player = require('./Player.js');

const Queue = require('./Queue.js');

const MazeInteraction = require('./MazeInteraction.js');

let players = {};

highscores = {};
	
shortestPath = -1;

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

function generateMaze(width, height) {
	w = width;
	h = height;
	shortestPath = -1;
	for (i = 0; i < height + 2; i++)
		maze[i] = [];
	do {
		fillRandomly(width, height);	
		buildFrame(width, height);
		buildEntry();
		buildExit(width, height);
		checkSolvable(new MazeInteraction(maze));
	} while (shortestPath == -1);
	Player.setMazeInteraction(new MazeInteraction(maze));
	return maze;
}

function getHighscores() {
	return highscores;
}

function setHighscore(key, value) {
	highscores[key] = value;
}

function getShortestDistance() {
	return shortestPath;
}

var keyIrrgartenkoenig = null;

function shortestPathLength(directions) {
	let pos = {x: w+1, y: h};
	while (pos.x != 0) {
		shortestPath++;
		solPath.push(pos);
		pos = directions[pos.y][pos.x].getCoordinates(pos.x, pos.y);
	}
	// set highscore
	if (keyIrrgartenkoenig != null) delete highscores[keyIrrgartenkoenig];
	let key = {
		username: "Irrgartenkönig",
		time: Date.now()
	}
	keyIrrgartenkoenig = JSON.stringify(key);
	highscores[keyIrrgartenkoenig] = {
		steps: shortestPath, 
		score: 100
	};	
}

function checkSolvable(mi) {
	queue = new Queue();
	let directions = [];
	for (i = 0; i < maze.length; i++) directions[i] = [];
	queue.offer({x: 0, y: 1, dir: Direction.RIGHT});
	while (!queue.empty()) {
		let u = queue.poll();
		if (u.x == w + 1) {
			shortestPathLength(directions, setHighscore);
			break;
		}
		let nDirections = [u.dir.left().left().left(), u.dir, u.dir.left()];
		for (d of nDirections) {
			if (mi.isAllowed(u.x, u.y, d)) {
				let n = d.getCoordinates(u.x, u.y);
				if (directions[n.y][n.x] === undefined) {
					directions[n.y][n.x] = d.left().left();
					queue.offer({x: n.x, y: n.y, dir: d});
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

module.exports = { addPlayer, movePlayer, getX, getY, generateMaze, 
getHighscores, setHighscore, getShortestPath, getSolution, getShortestDistance };

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

