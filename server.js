/**
 * The MazeRace
 */
 
// Maze.js
const maze = require("./Maze.js"); 
 
// express server
const express = require("express");
const server = express();
const cookieparser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

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

// WebSocket
const WebSocket = require("ws");
const serverSocket = new WebSocket.Server({ port: (portnumber+1) });

players = {}

// Start
server.get("/", (req, res) => {
    data = fs.readFileSync("public/Start.html", { encoding: 'utf8', flag: 'r' });
    res.send(data);
});

server.post("/getIn", (req, res) => {
	let session_id = req.cookies.session_id;
	if (session_id === undefined || players[session_id] === undefined) {
		session_id = JSON.stringify(Math.random());
		res.cookie("session_id", session_id);
		let playerData = {
			username: req.body.name,
			car: req.body.car,
			left: 100,
			top: 100
		}
		players[session_id] = playerData;
		maze.addPlayer(session_id, playerData.username, playerData.car);
	}
	console.log("Player got in: ("+session_id+", "+players[session_id].username+", "+players[session_id].car+")");
	res.send();
});

serverSocket.on('connection', function (socket) {
	console.log("Connection built");
	socket.onmessage = function incoming(event) {
		let action = JSON.parse(event.data);	
		if (maze.movePlayer(action.id, action.dir)) {
			// Update player data
			// players[action.id].left += ... depended on action.dir
			// send refresh message to all clients
		};		
    };
    socket.onclose = function (event) {
		// The ws communication has been cancelled here.
		// We could mark the player grey to show that he isn't available
	};
});
