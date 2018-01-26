const db = require('./db/connection');

module.exports = {
	getSandboxNameFromMessage: function (message) {
		var text = message.text,
			match = text.match(/((sandbox|adeng)-.*)/i);

		if (match) {
			return match[0];
		}
	},

	getSandboxOwner: function (channel, sandboxName) {
		return new Promise(function (resolve, reject) {
			db.get(
				"SELECT owner FROM sandboxes WHERE team = $teamChannel AND sandbox = $sandboxName",
				{ $teamChannel: channel, $sandboxName: sandboxName },
				function (err, row) {
					if (err || !row) {
						reject(err || 'sandbox does not exist');
						return;
					}

					return resolve({ result: row.owner });
				}
			);
		})
	}
};
