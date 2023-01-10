class Queue {
	
	constructor() {
		this.queue = [];
	}

	offer(element) {
		this.queue.push(element);
	}
	
	peek() {
		return this.queue[0];
	}
	
	poll() {
		return this.queue.splice(0, 1)[0];
	}
	
	empty() {
		return this.queue.length == 0;
	}
}

module.exports = Queue;
