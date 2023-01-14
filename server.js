// ==================================================MACE VARIABLES===========================================
const maze = require("./Maze.js");
const WIDTH = 30;
const HEIGHT = 20;
const REFRESHING_TIME = 20000;
const solutionCode = "2943";
var Direction = require('./Direction.js');
// ===========================================================================================================

// ==================================================RACE VARIABLES===========================================
var RACE_WAITING = false;
var RACE_WAIT_ON = 0;
var racers = {};
// ===========================================================================================================
 
// ==================================================EXPRESS SERVER===========================================
const express = require("express");
const server = express();
const cookieparser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
// ===========================================================================================================

//==================================================SERVER CONFIG=============================================
server.use(cookieparser());
// The folder with all html files
server.use(express.static("."));
server.set("view engine", "ejs");
// render the ejs views
server.set("views", path.join("views"));
// allow the express server to process POST request
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
// Portnumber
portnumber = 8082;
// WebSocket
const serverSocket = new WebSocket.Server({ port: (portnumber + 1) });
// ===========================================================================================================

// =============================================PLAYER DATA===================================================
players1 = {}
// ===========================================================================================================

// Server start
server.listen(portnumber, function ()  {
    console.log('listening at port ' + portnumber);
});

// Generates the maze
sendMazeToClients();

// Start
server.get("/", (req, res) => {
    data = fs.readFileSync("public/Start.html", { encoding: 'utf8', flag: 'r' });
    res.send(data);
});

server.get("/getHighscore", (req, res) => { 
	res.send(JSON.stringify(maze.getHighscores()));
});

server.post("/getSolution", (req, res) => {
	console.log("solution requested -> code: "+req.body.c+" player_id: "+req.cookies.session_id);
	if (req.body.c == solutionCode)	res.send(JSON.stringify(maze.getSolution()));
	else res.send();
});

server.post("/resume", (req, res) => {
	let session_id = req.cookies.session_id;
	if (session_id === undefined || players1[session_id] === undefined) {
		res.send("NO_DATA");
	} else {
		console.log("player "+players1[session_id]+" goes on playing");
		players1[session_id].status = 'playing';
		sendPlayerDataToEveryone(serverSocket, session_id);
		res.send();	
	}
});

// Mark the player dead
server.post("/restart", (req, res) => {
	console.log("restart");
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
	console.log("Player entered server: "+playerData.username+" ("+session_id+")");
	sendPlayerDataToEveryone(serverSocket, session_id);
	res.send();
});

// Mark the player sleeping
server.post("/markSleeping", (req, res) => {
	let session_id = req.cookies.session_id;
	// In general the data should be available
	if (!(session_id === undefined || players1[session_id] === undefined)) {
		console.log(players1[session_id].username+" is sleeping");
		players1[session_id].status = 'sleeping';
		
		// Remove his racing entry if the player was in a race
		if (RACE_WAITING && racers[session_id] !== undefined) {
			RACE_WAIT_ON++;
			delete racers[session_id];
		}
		
		sendPlayerDataToEveryone(serverSocket, session_id);
	}
	res.send();
});

// Actually, this post event is triggered after a getIn event automatically
server.post("/startRace", (req, res) => {
	let session_id = req.cookies.session_id;
	
	// If the client modified the code, he will get "NO_DATA" response
	if (session_id === undefined || players1[session_id] === undefined) {
		res.send("NO_DATA");
		return;
	}
	
	// The number of players he choose to play with
	let playerNumber = req.body.number;
	
	// The player object the maze.js works with
	let player = maze.getPlayer(session_id);
	
	// The JSON contains a placeholder for the socket for being able 
	// to send information about the ract to the player
	racers[session_id] = {
		playerObject: player,
		socket: null
	}
	
	// The player can't move while this is true
	// If he sends a move he request, his data won't be updated
	player.wait = true;
	
	// Another player started a race and is waiting for other players now -> Join his race
	if (RACE_WAITING) {
		RACE_WAIT_ON--;	
		
		// Send RACE_WAIT_ON to all waiting racers
		// The new racer gets the information automatically when the WebSocket connection is built
		for (key in racers)
			sendRaceWaitOn(racers[key].socket);				
		
		// The race is starting now	-> wait = false
		if (RACE_WAIT_ON == 0) {	
			for (key in racers)
				racers[key].playerObject.wait = false;				
			RACE_WAITING = false;
		}
			
		
	// Currently, there is no race-waiting -> start a new race
	} else if (playerNumber >= 2 && playerNumber <= 10) {
		RACE_WAITING = true;
		RACE_WAIT_ON = playerNumber - 1;
		console.log("start race with "+playerNumber+" players");
	}	
	
	res.send();
});

server.get("/newRaceStartable", (req, res) => {
	if (RACE_WAITING) res.send("NO");
	else res.send("YES");
});

serverSocket.on('connection', function (socket) {
	console.log("WebSocket connection built");
	sendMazeToClient(socket);
	
	socket.onmessage = function incoming(event) {
		let action = JSON.parse(event.data);	
			
		// Initial movement (A player joined the game)
		if (action.dir == "") {
			
			// Add his socket to the racing list if he has joined the race
			// Send information about how many players still have to join
			if (racers[action.id] !== undefined) {
				racers[action.id].socket = socket;
				sendRaceWaitOn(socket);
			}
			
			// Send the data of all active players to the new one
			// Possible, this command can already be executed after "sendMazeToClient"
			sendDataFromEveryoneToPlayer(socket);
			
			// Send the data of the new one to all active players
			sendPlayerDataToEveryone(serverSocket, action.id);	
				
		// A player wants to move -> if the player is allowed to move the code block is going to be executed
		} else if (maze.movePlayer(action.id, Direction.get(action.dir))) {	
					
			// Update the player data
			players1[action.id].left = maze.getX(action.id);
			players1[action.id].top = maze.getY(action.id);
			players1[action.id].direction = getAngle(action.dir);
					
			// The updated player data is going to be sent to all players including the one who moved
			sendPlayerDataToEveryone(serverSocket, action.id);
			
			// Send win event if the player has reached the target
			if (maze.isDone(action.id))
				sendWinDataToPlayer(socket, maze.getScoreOfPlayer(action.id));
				
		};		
    };
});

function sendRaceWaitOn(client) {
	if (client == null) return;
	let message = {
		type: "WAIT_ON",
		content: ""+RACE_WAIT_ON
	};
	client.send(JSON.stringify(message));
}

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
	mazeFields = maze.generateMaze(WIDTH, HEIGHT, false);
	let message = {
		type: "MAZE_CHANGE",
		content: mazeFields
	};
	serverSocket.clients.forEach(function each(client) {
		client.send(JSON.stringify(message));
	});
	setTimeout(sendMazeToClients, REFRESHING_TIME);
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
	else if (i == 5) path = '../pixelart/player_petrol.png';
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
