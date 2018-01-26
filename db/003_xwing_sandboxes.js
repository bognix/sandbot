const db = require('./connection'),
	channels = require('../channels');

db.serialize(function() {
	db.run("INSERT INTO sandboxes VALUES('sandbox-dedicated', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-xw1', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-xw2', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-so', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-qa04', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-mercury', '" + channels.XWING_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-content', '" + channels.XWING_CHANNEL_ID + "', '');");

	console.log("X-Wing sandboxes added.");

	db.close();
});
