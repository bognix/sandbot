const db = require('./connection'),
	channels = require('../channels');

db.serialize(function() {
	db.run("DROP TABLE IF EXISTS sandboxes;");
	db.run("CREATE TABLE sandboxes(sandbox TEXT PRIMARY KEY ASC, team TEXT, owner TEXT);");

	console.log("Database initialized.");

	db.close();
});
