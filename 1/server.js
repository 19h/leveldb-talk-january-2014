var multilevel = require("multilevel");
var net = require("net");
var level = require("hyperlevel");

var db = level("test");

net.createServer(function (socket) {
	socket
		// forward the connection to multilevel
		// it will handle the request and further
		// process it.
		.pipe(multilevel.server(db))
		// forward all the responses from multilevel
		// again back to the user
		.pipe(socket);
}).listen(3000);