/**
 * Get all allowed enum values: Object.keys(Direction) 
   returns an array ['Up', 'Down', 'Left', 'Right']
 * Check if a value equals an enum value: val === Direction.Up.name
 * Check if a value is in the enum: Direction.Up instanceof Direction
 */ 
class Direction{
	
	static RIGHT = new Direction(0);
	static UP = new Direction(1);
	static LEFT = new Direction(2);
	static DOWN = new Direction(3);
	
 	constructor(num){ 	
 		this.num = num;
	}
	
	static get(name) {
		if (name == "RIGHT") return Direction.RIGHT;
		else if (name == "UP") return Direction.UP;
		else if (name == "LEFT") return Direction.LEFT;
		else if (name == "DOWN") return Direction.DOWN;
	}
	
	equal(direction) {
		return this.num == direction.num;
	}
	
 	left() {
 		if(this.num == 0){
 			return Direction.UP;
 		} else if(this.num == 1){
 			return Direction.LEFT;
 		} else if(this.num == 2){
 			return Direction.DOWN;
 		}else if(this.num == 3){
 			return Direction.RIGHT;
 		}
 	}
 	
 	getCoordinates(xd, yd) {
		if (this.num == 0) return {x: xd+1, y: yd};
		if (this.num == 1) return {x: xd, y: yd-1};
		if (this.num == 2) return {x: xd-1, y: yd};
		if (this.num == 3) return {x: xd, y: yd+1};
	}
}

module.exports = Direction;
