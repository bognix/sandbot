var RtmClient = require('@slack/client').RtmClient,
	token = process.env.SANDBOT_TOKEN || '',
	sheet = require('./sheets'),
	Promise = require('bluebird'),
	request = require('request'),
	rtm = new RtmClient(token, {logLevel: 'error'}),
	auth = sheet.authorize(),

	RTM_EVENTS = require('@slack/client').RTM_EVENTS,
	STATUS_PATTERN = /^sandbot status$/i,
	BOOK_PATTERN = /^biore sandbox-/i,
	RELEASE_PATTERN = /^zwalniam sandbox-/i;

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
	if (message.text && STATUS_PATTERN.test(message.text)) {

		getStatus().then(function (data) {
			var promises = [];

			Object.keys(data.result).forEach(function (key) {
				promises.push(parseSandboxStatus(key, data.result[key]));
			});

			Promise.all(promises).then(function (data) {
				var parsedMsg = '```';
				data.forEach(function (item) {
					parsedMsg += item[0] + ': ' + item[1] + '\n';
				});
				rtm.sendMessage(parsedMsg + '```', message.channel);
			})
		})
	}

	if (message.text && BOOK_PATTERN.test(message.text)) {
		var sandboxName = getSandboxNameFromMessage(message),
			msg = '<@' + message.user + '> ';

		getPreviousUser(sandboxName)
			.then(function (previousUser) {
				if (previousUser.result) {
					msg += ':-1: - <@' + previousUser.result + '> is using it';
					rtm.sendMessage(msg, message.channel)
				} else {
					bookSandbox(message)
						.then(function () {
							msg += ':+1:';
							rtm.sendMessage(msg, message.channel)
						})
				}
			});
	}

	if (message.text && RELEASE_PATTERN.test(message.text)) {
		var msg = '<@' + message.user + '> ';

		releaseSandbox(message)
			.then(function () {
				msg += ':+1:';
				rtm.sendMessage(msg, message.channel)
			})
	}
});

function getStatus() {
	return new Promise(function (resolve, reject) {
		auth
			.then(function (authData) {
				return sheet.getStatus(authData);
			})
			.then(function (data) {
				resolve(data)
			});
	});
}

function getPreviousUser(sandboxName) {
	return new Promise(function (resolve, reject) {
		auth
			.then(function (authData) {
				return sheet.getCurrentUser(authData, sandboxName);
			})
			.then(function (data) {
				resolve(data);
			})
	})
}

function bookSandbox(message) {
	var sandboxName = getSandboxNameFromMessage(message);

	return new Promise(function (resolve, reject) {
		auth
			.then(function (authData) {
				return sheet.bookSandbox(authData, sandboxName, message.user);
			})
			.then(function (data) {
				resolve(data)
			})
	});
}

function getUserNameById(userId) {
	return new Promise(function (resolve, reject) {
		request(
			{
				url: 'https://slack.com/api/users.info',
				qs: {
					token: token,
					user: userId
				}
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					resolve(json.user.name);
				}
			})
	})
}

function getSandboxNameFromMessage(message) {
	var text = message.text,
		match = text.match(/(sandbox-.*)/i);

	if (match) {
		return match[0].replace('-', '_');
	}
}

function parseSandboxStatus(key, value) {
	if (value) {
		return new Promise(function (resolve, reject) {
			getUserNameById(value)
				.then(function (userName) {
					resolve([key, userName]);
				});
		});
	} else {
		return [key, 'free'];
	}
}

function releaseSandbox(message) {
	return new Promise(function (resolve, reject) {
		auth.then(function (authData) {
			var sandboxName = getSandboxNameFromMessage(message);

			return sheet.releaseSandbox(authData, sandboxName, message.user);
		}).then(function (data) {
			resolve(data)
		});
	});
}
