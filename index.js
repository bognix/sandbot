var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var token = process.env.SANDBOT_TOKEN || '';
var sheet = require('./sheets'),
	Promise = require('bluebird');

var request = require('request');

var STATUS_PATTERN = 'sandbot status';
var BOOK_PATTERN = 'biore sandbox-';
var RELEASE_PATTERN = 'zwalniam sandbox-';

var auth = sheet.authorize();
var rtm = new RtmClient(token, {logLevel: 'error'});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  	if (message.text.indexOf(STATUS_PATTERN) !== -1) {

  		getStatus().then(function(data) {
  			var promises = [];

	  		Object.keys(data.result).forEach(function(key) {
	  			promises.push(parseSandboxStatus(key, data.result[key]));
	  		})

	  		Promise.all(promises).then(function(data) {
	  			var parsedMsg = '```';
	  			data.forEach(function(item) {
	  				parsedMsg += item[0] + ': ' + item[1] + '\n';
	  			})
	  			rtm.sendMessage(parsedMsg + '```' , message.channel);
	  		})
		})
	}

	if (message.text.indexOf(BOOK_PATTERN) !== -1) {

		bookSandbox(message)
  		.then(function() {
  			var msg = '<@' + message.user + '> :+1:'
  			rtm.sendMessage(msg, message.channel)
  		})
	}

	if (message.text.indexOf(RELEASE_PATTERN) !== -1) {
		var channel = message.channel;
		releaseSandbox(message)
  		.then(function() {
  			var msg = '<@' + message.user + '> :+1:'
  			rtm.sendMessage(msg, message.channel)
  		})
	}
});

function getStatus() {
	return new Promise(function(resolve, reject) {
		auth
			.then(function(authData) {
				return sheet.getStatus(authData);
			})
			.then(function(data) {
				resolve(data)
			});
	});
}

function bookSandbox(message) {
	return new Promise(function(resolve, reject) {
		auth.then(function(authData) {
			var sandboxName = getSandboxNameFromMessage(message);

			return sheet.bookSandbox(authData, sandboxName, message.user);
		}).then(function(data) {
			resolve(data)
		});
	});
}

function getUserNameById(userId) {
	return new Promise(function(resolve, reject) {
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

	if(match) {
		return match[0].replace('-', '_');
	}
}

function parseSandboxStatus(key, value) {
	if (value) {
		return new Promise(function(resolve, reject) {
			getUserNameById(value)
			.then(function(userName) {
				resolve([key, userName]);
			});
		});
	} else {
		return [key, 'free'];
	}
}

function releaseSandbox(message) {
		return new Promise(function(resolve, reject) {
		auth.then(function(authData) {
			var sandboxName = getSandboxNameFromMessage(message);

			return sheet.releaseSandbox(authData, sandboxName, message.user);
		}).then(function(data) {
			resolve(data)
		});
	});
}