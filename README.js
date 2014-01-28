/* SNIPPET A */

	db.createReadStream({
		start: "kenan",
		end: "kenan" + "\xFF"
	}).on("data", function (data) {
		// data will be an object
		/* {
			key: <this will be the keyname, for instance: kenanÿ3063402796,
			value: <this will be my user id: 1234>
		} */
	}).on("end", function () {
		// this will be called if there is
		// no further key matching my query

		// if this is called without the "data"
		// event being emitted, there's no key
		// matching my query in the database
	})

/* SNIPPET B */

	var query = function (search, callback) {
		var exists = false, results = [];

		db.createReadStream({
			start: search,
			end: search + "\xFF"
		}).on("data", function (data) {
			if (!exists) exists = true;
			// data.value will be the user-id

			results.push(data.value)
		}).on("end", function () {
			// I'd return "false", but since "exists"
			// is already "false", lets return it
			if (!exists) return callback(exists);

			callback(results)
		})
	}

/* SNIPPET C */

	var searchAndResolve = function (searchterm, callback) {
		query(searchterm, function (results) {
			if (!results)
				return callback("Sorry, nothing was found");

			var i = 0, n = results.length;
			var output = "Found:\n\n";

			// Array.prototype.forEach calls the callback
			// with 1. the keyvalue 2. the index 3. the full array
			results.forEach(function (userid, index, results) {
				users.get(userid, function (err, data) {
					// if "err" is not false, the user might
					// have been deleted from the database.

					// i is out iterator to make sure that we're
					// not firing too early, since everything
					// here is asynchronous :(
					if(err) return ++i === n && callback(output);

					output += data.name + ", living in " + data.city + "\n";

					return ++i === n && callback(output);
				})
			})
		})
	}

/* SNIPPET D */

	Found:

	Kenan Sulayman, living in Berlin
	Kenan Yamaha, living in Helsinki