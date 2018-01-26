const db = require('./connection'),
	channels = require('../channels');

db.serialize(function() {
	db.run("INSERT INTO sandboxes VALUES('sandbox-qa01', '" + channels.IRIS_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-qa02', '" + channels.IRIS_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-qa03', '" + channels.IRIS_CHANNEL_ID + "', '');");

	console.log("Iris sandboxes added.");

	db.close();
});
