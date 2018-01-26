const request = require('request'),
	channels = require('./channels');

module.exports = {
	pattern: /sandbot joke/i,
	action: function (rtm, message) {
		request(
			{
				url: 'http://api.icndb.com/jokes/random'
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					const json = JSON.parse(body);
					rtm.sendMessage(json.value.joke, message.channel);
				}
			});
	}
};
