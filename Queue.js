let queue = [];

function offer(element) {
	queue.push(element);
}

function peek() {
	return queue[0];
}

function poll() {
	let toReturn = queue[0];
	delete queue[0];
	return toReturn;
}

function empty() {
	return queue.length == 0;
}

module.exports = {offer, peek, poll, empty};
