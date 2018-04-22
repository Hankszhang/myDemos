var fork = require('child_process').fork;
var cpus = require('os').cpus();

var server = require('net').createServer();
server.listen(1338);

var workers = Object.create(null);
var createWorker = function () {
	var worker = fork(__dirname + '/child.js');
	
	worker.send('server', server);
	workers[worker.pid] = worker;
	console.log('Create worker, pid is ' + worker.pid);
	
	// create a new worker when one exited
	worker.on('exit', function() {
		console.log('Worker ' + worker.pid + ' exited.');
		delete workers[worker.pid];
		createWorker();
	});
}

cpus.forEach(cpu => {
	createWorker();
});

// kill all workers when exit master
process.on('exit', function () {
	for (var pid in workers) {
		workers[pid].kill();
	}
});