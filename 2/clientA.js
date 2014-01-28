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

// asynchronous methods
setInterval(function (){
	// Generate a random value.
	// Explanation:
	// 1. Math.random() will return a float between [0|1],
	// 	we can abuse the effect to get a random value
	// 	beween 0 and the value we're trying to be max
	// 	here it's 10000 (1E4 means 1 and 4 zeroes)
	// 2. |0 means convert the number to an integer. This
	// 	will remove anything behind the point (1.XXX)
	// 	and is exactly Math.floor.
	// 3. .toString(16) means convert the integer to a hex
	// 	string that can be represented as a string.
	var randomValue = ((Math.random()*1E4)|0).toString(16);

	// Explanation:
	// 1. Generate a key in the form "foo" and the current
	//	process-id, so that we get a unique value for
	// 	current process.
	// 2. Write our random value as the generated key.
	db.put("foo" + process.pid, randomValue, function () {
		console.log("Written: " + randomValue);
	});
}, 1000)