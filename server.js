/**
 * The MazeRace
 */
 
// express server
const express = require("express");
const server = express();
//const cookieparser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

//server.use(cookieparser());
// The folder with all html files
server.use(express.static("public"));
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
	data = fs.readFileSync("Start.html", { encoding: 'utf8', flag: 'r' });
    res.send(data);
});

serverSocket.on('connection', function (socket) {
	console.log("Connection built");
	socket.onmessage = function incoming(event) {
		let player = JSON.parse(event.data);
		//TODO: add a session id stored in the cookies
		
		// By the way, onmessage isn't called when invoking socket.send(player) in 
		// Start.html->start()->last_line_of_code. It should be called...
		players.push(player);
		console.log(player.name+" logged in with car "+player.car);
    }    
    
});
