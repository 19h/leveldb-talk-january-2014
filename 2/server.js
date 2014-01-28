var multilevel = require("multilevel");
var net = require("net");
var level = require("hyperlevel");

var db = level("test");

// Explanation:
// 1. Wrap the database with level-live-stream
//	and hook all inserts (put, delete) as
//	events we can listen to.
	var liveStream = require("level-live-stream")(db);

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

// Explanation:
// 1. Hook all possible events.
// 	"data" will be an object including
// 	A) Type of the event: delete, put, read
// 	B) Key inserted
// 	C) Value of the key inserted
	liveStream.on('data', function (data) {
		console.log(data)
	})