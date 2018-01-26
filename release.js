const
	common = require('./common'),
	db = require('./db/connection'),
	Promise = require('bluebird'),
	getSandboxNameFromMessage = common.getSandboxNameFromMessage,
	getSandboxOwner = common.getSandboxOwner;

function updateDbWithRelease(sandboxName, channel) {
	return new Promise(function (resolve, reject) {
		db.run(
			"UPDATE sandboxes SET owner = '' WHERE team = $teamChannel AND sandbox = $sandboxName",
			{ $teamChannel: channel, $sandboxName: sandboxName },
			function (err) {
				if (err) {
					reject(err);
				}

				resolve();
			}
		);
	});
}

function releaseSandbox(message) {
	var sandboxName, response;

	return new Promise(function (resolve, reject) {
		sandboxName = getSandboxNameFromMessage(message);

		return getSandboxOwner(message.channel, sandboxName)
		.then(function (sandboxOwner) {
			if (sandboxOwner.result && sandboxOwner.result !== message.user) {
				response = ':pirate: take over!!! <@' + sandboxOwner.result + '>, <@' + message.user + '> is releasing your sandbox! :pirate:';

				return updateDbWithRelease(sandboxName, message.channel)
				.then(function () {
					resolve({
						response: response,
						data: {}
					});
				});
			} else {
				return updateDbWithRelease(sandboxName, message.channel)
				.then(function () {
					resolve({
						data: {}
					});
				});
			}
		});
	})
}

module.exports = {
	pattern: /(zwalniam|releasing) (sandbox|adeng)-/i,
	action: function (rtm, message) {
		releaseSandbox(message)
		.then(function (data) {
			if (data.response) {
				rtm.sendMessage(data.response, message.channel);
			} else {
				var msg = '<@' + message.user + '> :+1:';
			}
			rtm.sendMessage(msg, message.channel);
		})
		.catch(function (err) {
			rtm.sendMessage(`:x: sandbot error: \`${err}\`, try again`, message.channel);
		});
	}
};
