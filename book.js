const
	common = require('./common'),
	db = require('./db/connection'),
	getSandboxNameFromMessage = common.getSandboxNameFromMessage,
	getSandboxOwner = common.getSandboxOwner;

function bookSandbox(message) {
	const sandboxName = getSandboxNameFromMessage(message);

	console.log('Booking', sandboxName, 'for', message.user, 'on', message.channel);
	return new Promise(function (resolve, reject) {
		db.run(
			"UPDATE sandboxes SET owner = $userId WHERE team = $teamChannel AND sandbox = $sandboxName",
			{ $userId: message.user, $teamChannel: message.channel, $sandboxName: sandboxName },
			function (err, row) {
				if (err) {
					reject(err);
				}

				return resolve();
			}
		);
	});
}

module.exports = {
	pattern: /(biore|taking) (sandbox|adeng)-/i,
	action: function (rtm, message) {
		const sandboxName = getSandboxNameFromMessage(message);
		let msg = '<@' + message.user + '> ';

		getSandboxOwner(message.channel, sandboxName)
		.then(function (sandboxOwner) {
			if (sandboxOwner.result) {
				msg += ':-1: - <@' + sandboxOwner.result + '> is using it';
				rtm.sendMessage(msg, message.channel)
			} else {
				bookSandbox(message)
				.then(function () {
					msg += ':+1:';
					rtm.sendMessage(msg, message.channel)
				})
			}
		})
		.catch(function (err) {
			rtm.sendMessage(`:x: sandbot error: \`${err}\`, try again`, message.channel);
		});
	}
};
