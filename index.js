const { RTMClient } = require('@slack/client');
const db = require('./db/connection');
const STATUS = require('./status');
const BOOK = require('./book');
const RELEASE = require('./release');
const PING = require('./ping');
const JOKE = require('./joke');

const token = process.env.SANDBOT_TOKEN || '';
const rtm = new RTMClient(token, { logLevel: 'error' });
const ACTIONS = [
  STATUS,
  BOOK,
  RELEASE,
  PING,
  JOKE,
];

console.log('Sandbot activated.');
rtm.start();
console.log('Slack RTM started.');

rtm.on('message', (message) => {
  if (message.text) {
    ACTIONS.forEach((item) => {
      if (item.pattern.test(message.text)) {
        item.action(rtm, message);
      }
    });
  }
});

function exitHandler() {
  console.log('Closing connection to database.');
  db.close();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
