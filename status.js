const Promise = require('bluebird'),
	token = process.env.SANDBOT_TOKEN || '',
	request = require('request'),
	db = require('./db/connection');

function getStatus(channel) {
	return new Promise(function (resolve, reject) {
		db.all(
			"SELECT sandbox, owner FROM sandboxes WHERE team = $teamChannel",
			{ $teamChannel: channel },
			function (err, rows) {
				if (err) {
					reject(err);
				}

				const result = {};

				rows.forEach(function (row) {
					if (row.sandbox) {
						result[row.sandbox] = row.owner;
					} else {
						console.log('Invalid row.');
					}
				});

				resolve({ result: result });
			}
		);
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

module.exports = {
	pattern: /sandbot status/i,
	action: function (rtm, message) {
		console.log("Checking status...");
		getStatus(message.channel).then(function (data) {
			const promises = [];

			Object.keys(data.result).forEach(function (key) {
				promises.push(parseSandboxStatus(key, data.result[key]));
			});

			Promise.all(promises).then(function (data) {
				let parsedMsg = '```';
				data.forEach(function (item) {
					parsedMsg += item[0] + ': ' + item[1] + '\n';
				});
				rtm.sendMessage(parsedMsg + '```', message.channel);
			})
		});
	}
};
