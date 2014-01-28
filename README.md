	Thanks for you interest in my talk resources. If you have any questions that are not answered here, do not hesitate to contact me at kenan@sly.mn or mention me on Twitter (@kenansulayman).

## LevelDB Talk at Nodejs Meetup Berlin (27. January, 2014)

This repository contains all code examples presented in the talk.

Please load all necessary modules before getting started:

	npm install

This will install `hyperlevel` (please checkout https://github.com/rvagg/node-levelup for the api to the Node LevelDB bindings, made by @rvagg and contributors), `multilevel` (a module for exposing LevelDB over a raw TCP socket, made by @juliangruber), `level-live-stream` (a module for hooking realtime inserts and deletions; emits events you can listen for, made by @domictarr) and `level-sublevel` (a high-level module translating prefixed keys to "tables" inside the Level database, made by @dominictarr).

*Simply proceed with the example code if the text below is too long for you to read, which I would be sorry for.*

If you want to see a real-world application, please checkout https://github.com/kenansulayman/level-namequery — we're currently using that in production make names of users searchable.

To make this better understandable, I will try to explain how we achieve that:

You should already be aware that in LevelDB, every key is sorted and only consisting of a string. That is, we have created a database with user ids. (let's assume mine is ***1234*** and my name is ***Kenan Sulayman***)

Namequery splits my name in two parts, namely ***Kenan*** and ***Sulayman***. These will be lower-cased (***kenan***, ***sulayman***) and suffixed by a crc hash of the user id (looking at nq.js, you might noticed that we implemented our own version of a hashing algorithm) to mitigate issues, where two users have the same name. The hash-suffix of the key is prepended by ***\xFF***, as I mentioned in the talk, so that we can distinguish the hash from any possible name. (***kenanasdf*** could be inserted as name, for instance, that's why ***kenanÿasdf*** is a bit more straightforward) That is, we now have two keys: ***kenanÿ3063402796*** and ***sulaymanÿ3063402796*** (3063402796 is the hash of ***1234***) where the value of both keys will be ***1234*** (my user-id).

Now, if a user searches for "kenan" we will do a search in the database as follows:

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

This will, with ***kenanÿ3063402796*** being in the database, yield this exact key. In order to provide more convenience for the user, you will use namequery **under** your application and then use the user id to get further information about the user account.

For instance, we have a database called ***users*** where ***1234*** is my user-id. Since our query in the Level database yielded this exact user-id, we can gather the data from the ***users*** database and output this to the user.

I prepared an example for you, where you're searching the database for these user-ids, resolve them and generate a "human readable" response from it.

First, you'll have a function querying the database to your needs:

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

Then you'll take that function and wrap it into a higher level parser that will convert your results into a human-targeted response. Even though this might look complicated, all we do is iterating over an array, making sure we keep the code as race-condition-free as possible.

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

					// i is our iterator to make sure that we're
					// not firing too early, since everything
					// here is asynchronous :(
					if(err) return ++i === n && callback(output);

					output += data.name + ", living in " + data.city + "\n";

					return ++i === n && callback(output);
				})
			})
		})
	}

This will, for instance, with ***searchterm*** being ***kenan*** yield the following result:

	Found:

	Kenan Sulayman, living in Berlin
	Kenan Yamaha, living in Helsinki

You will find all snippets of this *README* in ***README.js***.

I hope you can proceed from this place to your own adventure. Please ask me or provide feedback, if you feel alike.

**チャレンジして失敗ことを恐れるよりも、何もしないことを恐れろ。**

**Instead of being afraid of the challenge and failure, be afraid of avoiding the challenge and doing nothing.**