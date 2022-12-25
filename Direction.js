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
	
	equal(direction) {
		if (this.num == 0 && direction == "RIGHT") return true;
		if (this.num == 1 && direction == "UP") return true;
		if (this.num == 2 && direction == "LEFT") return true;
		if (this.num == 3 && direction == "DOWN") return true;
		return false;
	}
	
 	left(){
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
}
