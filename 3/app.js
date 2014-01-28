// Explanation:
// 1. Create a level database where each key
// 	is encoded or decoded by the given function.
//	In this case the encoding and decoding is
//	done by JSON.parse and JSON.stringify.
//	That is, we can insert objects into our level
//	database. For instance, when writing:
// 	db.put("kenan", { type: "Engineering" });
// 	it will at first be encoded to
//	'{"type":"Engineering"}' (a JSON string)
// 	before writing to the database.
var db = require("hyperlevel")("test", {
	encoding: {
		encode: JSON.stringify,
		decode: JSON.parse
	}
}), db = require("level-sublevel")(db);

var dt = new Date;

// Explanation:
// 1. Create a prefixed area in the database,
// 	where each key being inserted will be
//	prefixed by this particular key.
// 2. Chaining sublevels will simply create
//	a prefix inside the given prefix.
// 	For instance:
//
//	db
//		.sublevel("germany")
//		.sublevel("staff")
//		.sublevel("administrators")
//
//	Will create this prefix:
//	ÿgermanyÿstaffÿadministratorsÿ
//
//	So, when you're writing a key:
//	"kenan" with value '{"type":"Engineering"}'
//
//	The key will actually be written as
// 	ÿgermanyÿstaffÿadministratorsÿkenan
//	into the database.

var people = db.sublevel("people");
	// ÿpeopleÿ

	people.put("kenan", { type: "Engineering" });
		// ÿpeopleÿkenanÿ

	people.put("dominique", { type: "Financials" });
		// ÿpeopleÿdominiqueÿ

/*
	ÿpeopleÿ
	ÿpeopleÿkenan
	ÿpeopleÿdominique
*/

var weather = db.sublevel("weather");
	// ÿweatherÿ

	var year = weather.sublevel(String(dt.getFullYear()));
		// ÿweatherÿ2014ÿ

		var january = year.sublevel(String(dt.getMonth() + 1));
			// ÿweatherÿ2014ÿ1ÿ

			january.put(String(dt.getDate()), { type: "snowy" })

/*
	ÿweatherÿ
	ÿweatherÿ2014ÿ
	ÿweatherÿ2014ÿ1ÿ27
*/