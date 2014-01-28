var multilevel = require("multilevel");
var net = require("net");

var db = multilevel.client();
var con = net.connect(3000);

con
	// Connect to the multilevel server
	// and forward any incoming data
	// to the multilevel client.
	.pipe(db.createRpcStream())
	// Forward the responses from our
	// multilevel client back to the
	// multilevel server.
	.pipe(con);

// Explanation:
// 1. Create an infinite loop where the
//	callback is fired every 1 second.
setInterval(function () {
	// Explanation:
	// 1. Create a ReadStream from the database.
	// 	This is effectively a query where we
	// 	get all keys in the database.
	// 	I don't have to hook the "end"-event
	//	because I will only output existing
	// 	values.
	db.createReadStream().on("data", function (data) {
		console.log(data)
	});
}, 1000);