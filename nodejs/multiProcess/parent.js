var cp = require('child_process');
var child1 = cp.fork('child.js');
var child2 = cp.fork('child.js');

var server = require('net').createServer();

server.on('connection', function (socket) {
	socket.end('\nhandled by parent\n');
});

server.listen(1337, function () {
	console.log('start listenning on port 1337');
	child1.send('server', server);
	child2.send('server', server);
	server.close();
});