// Box width 1520
const bw = 1520;

// Box height 760
const bh = 760;

// Padding
const p = 0;
		
const hardMode = 20;
const mediumMode = 40;
const easyMode = 76;

let mode = hardMode;

let width = bw / mode;
let height = bh / mode;

// Maze
let maze = [];

function generateMaze() {
	let solvable = false;
	do {
		fillRandomly();	
		buildFrame();
		buildEntry();
		buildExit();
		/*
		Player tester = new Player(0, 1, null);
		try {
			solvable = tester.autoMove(0);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}*/
		solvable = true;
	} while (!solvable);
}

function fillRandomly() {
	for (i = 0; i < bh / mode; i++) {
		maze[i] = [];
		for (k = 0; k < bw / mode; k++) {
			maze[i][k] = 1 << Math.floor(Math.random() * 4);
		}
	}
}

function buildFrame() {		
	for (y = 1; y < height; y++) { // Right line
		maze[y][width] = maze[y][width] | 0b100;
	}
	for (x = 1; x < width; x++) { // Upper line
		maze[0][x] = maze[0][x] | 0b1000;
	}
	for (y = 1; y < height; y++) { // Left line
		maze[y][0] = maze[y][0] | 0b1;
	}
	for (x = 1; x < width; x++) { // Lower line
		maze[height][x] = maze[height][x] | 0b10;
	}
}
	
function buildEntry() {
	maze[0][0] = 0b1000;
	maze[1][0] = 0b1000;
}
	
function buildExit() {
	maze[height - 1][width] = 0b10;
	maze[height][width] = 0b10;
}

function draw(){
	const mazegame = document.getElementById("MazeGame");
	const options = document.getElementById("Options");
	
	if(mazegame.getContext){
	    	
	    const mazegame2d = mazegame.getContext("2d");
	    const options2d = mazegame.getContext("2d");
	    
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
	    mazegame2d.fillStyle = "rgb(255,0,0)";
	    mazegame2d.fillRect(0,0, 10,10);
		mazegame2d.fillStyle = "rgb(0, 0, 0)";
	
		for (y = 0; y < bh / mode; y++) {
			for (x = 0; x < bw / mode; x++) {
				console.log("Jaja"+maze[y][x]);
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
	/*	
		
		
		for (let x = 0; x <= bw; x += mode) {
			mazegame2d.moveTo(x + p, p);
		    mazegame2d.lineTo(x + p, bh + p);
		}
		
		for (let x = 0; x <= bh; x += mode) {
		    mazegame2d.moveTo(p, x + p);
		    mazegame2d.lineTo(bw + p, x + p);
		}*/
		
		mazegame2d.stroke();
		
	} else{
	    	// canvas unsupported code here
	    	console.log("UNSUPPORTED BROWSER DETECTED, PLEASE CHANGE BROWSER TO CONTINUE");
	}	    
}  

generateMaze();
draw();