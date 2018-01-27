const RtmClient = require('@slack/client').RtmClient,
    token = process.env.SANDBOT_TOKEN || '',
    rtm = new RtmClient(token, {logLevel: 'error'}),
    db = require('./db/connection'),
	STATUS = require('./status'),
	BOOK = require('./book'),
	RELEASE = require('./release'),
	PING = require('./ping'),
	JOKE = require('./joke'),

    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    ACTIONS = [
		STATUS,
        BOOK,
		RELEASE,
		PING,
        JOKE
    ];

console.log("Sandbot activated.");
rtm.start();
console.log("Slack RTM started.");

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    if(message.text) {
		ACTIONS.forEach(function (item) {
			if(item.pattern.test(message.text)) {
                item.action(rtm, message);
			}
		});
    }
});

function exitHandler() {
    console.log("Closing connection to database.");
    db.close();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
