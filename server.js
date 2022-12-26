/**
 * The MazeRace
 */
 
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
	let playerData = {
		username: req.body.name,
		car: req.body.car,
		left: 100,
		top: 100
	}
	players[req.body.websocket] = playerData;
});

serverSocket.on('connection', function (socket) {
	console.log("Connection built");
	socket.onmessage = function incoming(event) {
		// The current player data is accessable via players[socket]
		// In event, the current movement is stored
		// player data has to be updated matching the movement
    }   
    
});
