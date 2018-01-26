const db = require('./connection'),
	channels = require('../channels');

db.serialize(function() {
	db.run("INSERT INTO sandboxes VALUES('sandbox-adeng01', '" + channels.ADENG_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-adeng02', '" + channels.ADENG_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-adeng03', '" + channels.ADENG_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-adeng04', '" + channels.ADENG_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('sandbox-adeng05', '" + channels.ADENG_CHANNEL_ID + "', '');");
	db.run("INSERT INTO sandboxes VALUES('adeng-fandom', '" + channels.ADENG_CHANNEL_ID + "', '');");

	console.log("AdEng sandboxes added.");

	db.close();
});
