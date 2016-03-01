/*
var http = require('http');
http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<h1>Node.js</h1>');
	res.end('<p>Hello World2</p>');

}).listen(3000);
console.log("HTTP server is listening at port 3000.");





var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
event.on('some_event', function(){
	console.log('<p>some_event</p>');
});
setTimeout(function(){
	event.emit('some_event');
}, 1000);

*/

exports.hello = function(){
	console.log('interface ');
}
