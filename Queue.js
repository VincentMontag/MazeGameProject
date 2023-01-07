let queue = [];

function offer(element) {
	queue.push(element);
}

function peek() {
	return queue[0];
}

function poll() {
	return queue.splice(0, 1)[0];
}

function empty() {
	return queue.length == 0;
}

module.exports = {offer, peek, poll, empty};
