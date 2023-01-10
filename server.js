/**
 * The Maze-Race in Space
 */
 
// Maze.js
const maze = require("./Maze.js"); 

let mazeFields = maze.generateMaze(40, 25, true);

const solutionCode = "2943";

var Direction = require('./Direction.js');
 
// express server
const express = require("express");
const server = express();
const cookieparser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

server.use(cookieparser());
// The folder with all html files
server.use(express.static("."));
server.set("view engine", "ejs");

// render the ejs views
server.set("views", path.join("views"));

// allow the express server to process POST request
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

portnumber = 8082;

server.listen(portnumber, function ()  {
    console.log('listening at port ' + portnumber);
});

// WebSocket for player move information
const serverSocket = new WebSocket.Server({ port: (portnumber + 1) });

// WebSocket for maze change information
const serverSocketMaze = new WebSocket.Server({ port: (portnumber + 2) });

players1 = {}

// Start
server.get("/", (req, res) => {
    data = fs.readFileSync("public/Start.html", { encoding: 'utf8', flag: 'r' });
    res.send(data);
});

server.get("/getMaze", (req, res) => {
	res.send(JSON.stringify(mazeFields));
});

server.get("/getHighscore", (req, res) => { 
	res.send(JSON.stringify(maze.getHighscores()));
});

server.post("/getSolution", (req, res) => {
	console.log("received code "+req.body.c);
	if (req.body.c == solutionCode)	res.send(JSON.stringify(maze.getSolution()));
	else res.send();
});

server.post("/getIn", (req, res) => {
	if (usernameAlreadyUsed(req.body.name)) {
		res.send("ALREADY_USED");
		return;
	}
	let session_id = req.cookies.session_id;
	if (session_id === undefined || players1[session_id] === undefined) {
		session_id = JSON.stringify(Math.random());
		res.cookie("session_id", session_id);
		maze.addPlayer(session_id, req.body.name);
		let playerData = {
			username: req.body.name,
			rocket: getImagePath(req.body.rocket),
			left: maze.getX(session_id),
			top: maze.getY(session_id),
			direction: 90,
			status: 'playing'
		}
		players1[session_id] = playerData;		
	} else {
		players1[session_id].status = 'playing';
	}	
	console.log("Player got in: ("+
		session_id+", "+
		players1[session_id].username+", "+
		players1[session_id].rocket+", "+
		players1[session_id].left+", "+
		players1[session_id].top+", "+
		players1[session_id].direction+", "+
		players1[session_id].status+")");
	res.send();
});

// Mark the player dead
server.post("/endSession", (req, res) => {
	let session_id = req.cookies.session_id;
	if (!(session_id === undefined || players1[session_id] === undefined)) {
		players1[session_id].status = 'dead';
		sendPlayerDataToEveryone(serverSocket, session_id);
		delete players1[session_id];
	}
	res.send();
});

// Mark the player sleeping
server.post("/markSleeping", (req, res) => {
	console.log("sleep");
	let session_id = req.cookies.session_id;
	// In general the data should be available
	if (!(session_id === undefined || players1[session_id] === undefined)) {
		players1[session_id].status = 'sleeping';
		sendPlayerDataToEveryone(serverSocket, session_id);
	}
	res.send();
});

serverSocketMaze.on('connection', function (socket) {
	console.log("WebSocket connection built for generating the maze");
	
	socket.onmessage = function incoming (event) {
		// Client received the maze
		// Now give him 3 ghost steps
	};
});

function sendMazeToClients() {
	mazeFields = maze.generateMaze(40, 25, false);
	serverSocketMaze.clients.forEach(function each(client) {
		client.send(JSON.stringify(mazeFields));
	});
	setTimeout(sendMazeToClients, 30000);
}

setTimeout(sendMazeToClients, 30000);

serverSocket.on('connection', function (socket) {
	console.log("WebSocket connection built for moving");
	
	socket.onmessage = function incoming(event) {
		let action = JSON.parse(event.data);
		
		// A player joined the game
		if (action.dir == "") {
			sendDataFromEveryoneToPlayer(socket);
			sendPlayerDataToEveryone(serverSocket, action.id);			
		
		// A player moves
		} else if (maze.movePlayer(action.id, Direction.get(action.dir))) {
			
			// Update player data on server
			players1[action.id].left = maze.getX(action.id);
			players1[action.id].top = maze.getY(action.id);
			players1[action.id].direction = getAngle(action.dir);
			
			// Prepare update data and send it
			sendPlayerDataToEveryone(serverSocket, action.id);
		};		
    };
});

// If a new player joined the game he has to draw all the active players
function sendDataFromEveryoneToPlayer(socket) {
	for (ids in players1) {				
		let update = players1[ids];
		socket.send(JSON.stringify(update))
	}
}

// If a player moved or joined tha game everyone has to update this player data
function sendPlayerDataToEveryone(serverSocket, actionid) {
	let update = players1[actionid];
	serverSocket.clients.forEach(function each(client) {
		client.send(JSON.stringify(update));
	});
}

function getImagePath(i) {
	let path = "";
	if (i == 1) path = '../pixelart/player_blue.png';
	else if (i == 2) path = '../pixelart/player_brown.png';
	else if (i == 3) path = '../pixelart/player_green.png';
	else if (i == 4) path = '../pixelart/player_grey.png';
	else if (i == 5) path = '../pixelart/player_patrol.png';
	else if (i == 6) path = '../pixelart/player_pink.png';
	else if (i == 7) path = '../pixelart/player_purple.png';
	else if (i == 8) path = '../pixelart/player_red.png';
	else if (i == 9) path = '../pixelart/player_white.png';
	else if (i == 10) path = '../pixelart/player_yellow.png';
	return path;
}

function getAngle(direction) {
	let angle = 0;
	if (direction == "RIGHT") angle = 90;
	else if (direction == "LEFT") angle = 270;
	else if (direction == "DOWN") angle = 180;
	return angle;
}

function usernameAlreadyUsed(name) {
	for (ids in players1)
		if (players1[ids].username == name) return true;
	return false;
}
