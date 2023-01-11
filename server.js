/**
 * The Maze-Race in Space
 */
 
// Maze.js
const maze = require("./Maze.js"); 

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

sendMazeToClients();

players1 = {}

// Start
server.get("/", (req, res) => {
    data = fs.readFileSync("public/Start.html", { encoding: 'utf8', flag: 'r' });
    res.send(data);
});

server.get("/getHighscore", (req, res) => { 
	res.send(JSON.stringify(maze.getHighscores()));
});

server.post("/getSolution", (req, res) => {
	console.log("received code "+req.body.c);
	if (req.body.c == solutionCode)	res.send(JSON.stringify(maze.getSolution()));
	else res.send();
});

server.post("/resume", (req, res) => {
	let session_id = req.cookies.session_id;
	if (session_id === undefined || players1[session_id] === undefined) {
		res.send("NO_DATA");
	} else {
		players1[session_id].status = 'playing';
		sendPlayerDataToEveryone(serverSocket, session_id);
		res.send();	
	}
});

// Mark the player dead
server.post("/restart", (req, res) => {
	let session_id = req.cookies.session_id;
	if (!(session_id === undefined || players1[session_id] === undefined)) {
		players1[session_id].status = 'dead';
		sendPlayerDataToEveryone(serverSocket, session_id);
		delete players1[session_id];
	}
	if (req.body.name == "") {
		res.send("EMPTY_NAME");
		return;
	}
	if (usernameAlreadyUsed(req.body.name)) {
		res.send("ALREADY_USED");
		return;
	}	
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
	console.log("Player entered server: "+playerData.username);
	sendPlayerDataToEveryone(serverSocket, session_id);
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

server.post("/startRace", (req, res) => {
	let playerNumber = req.body.number;
	console.log("start race with "+playerNumber+" players");
	res.send();
});

server.get("/newRaceStartable", (req, res) => {
	res.send("NO");
});

serverSocket.on('connection', function (socket) {
	console.log("WebSocket connection built for moving");
	sendMazeToClient(socket);
	
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
			// Send win event
			if (maze.isDone(action.id))
				sendWinDataToPlayer(socket, maze.getScoreOfPlayer(action.id));
		};		
    };
});

// If a new player joined the game he has to draw all the active players
function sendDataFromEveryoneToPlayer(socket) {
	for (ids in players1) {		
		let message = {
			type: "MOVE",
			content: players1[ids]
		};
		socket.send(JSON.stringify(message))
	}
}
 
// If a player moved or joined tha game everyone has to update this player data
function sendPlayerDataToEveryone(serverSocket, actionid) {
	let message = {
		type: "MOVE",
		content: players1[actionid]
	};
	serverSocket.clients.forEach(function each(client) {
		client.send(JSON.stringify(message));
	});
}

function sendMazeToClients() {
	mazeFields = maze.generateMaze(20, 10, false);
	let message = {
		type: "MAZE_CHANGE",
		content: mazeFields
	};
	serverSocket.clients.forEach(function each(client) {
		client.send(JSON.stringify(message));
	});
	setTimeout(sendMazeToClients, 20000);
}

function sendMazeToClient(client) {
	let message = {
		type: "MAZE_CHANGE",
		content: mazeFields
	};
	client.send(JSON.stringify(message));
}

function sendWinDataToPlayer(client, score) {
	let message = {
		type: "WIN",
		content: score
	};
	client.send(JSON.stringify(message));
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
