package pack1;

enum Direction {
	
	RIGHT(0), UP(1), LEFT(2), DOWN(3);
	
	int num;
	
	Direction(int num) {
		this.num = num;
	}
	
	Direction left() {
		return Direction.values()[(num + 1) % 4];
	}
	
}