const Promise = require('bluebird');
const request = require('request');
const db = require('./db/connection');

const token = process.env.SANDBOT_TOKEN || '';
const k8sSandboxes = [
  'sandbox-qa01',
  'sandbox-qa02',
  'sandbox-qa03',
  'sandbox-qa04',
];

function getStatus(channel) {
  return new Promise(((resolve, reject) => {
    db.all(
      'SELECT sandbox, owner FROM sandboxes WHERE team = $teamChannel',
      { $teamChannel: channel },
      (err, rows) => {
        if (err) {
          reject(err);
        }

        const result = {};

        rows.forEach((row) => {
          if (row.sandbox) {
            if (k8sSandboxes.includes(row.sandbox)) {
              result[row.sandbox] = `${row.owner} // k8s sandbox`;
            } else {
              result[row.sandbox] = row.owner;
            }
          } else {
            console.log('Invalid row.');
          }
        });

        resolve({ result });
      },
    );
  }));
}


function getUserNameById(user) {
  return new Promise((resolve) => {
    request(
      {
        url: 'https://slack.com/api/users.info',
        qs: {
          token,
          user,
        },
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(JSON.parse(body).user.name);
        }
      },
    );
  });
}

function parseSandboxStatus(key, value) {
  if (value) {
    return new Promise((resolve) => {
      getUserNameById(value)
        .then((userName) => {
          resolve([key, userName]);
        });
    });
  }

  return [key, 'free'];
}

module.exports = {
  pattern: /sandbot status/i,
  action(rtm, message) {
    console.log('Checking status...');
    getStatus(message.channel).then((statusData) => {
      const promises = Object.keys(statusData.result)
        .map(key => parseSandboxStatus(key, statusData.result[key]));

      Promise.all(promises).then((data) => {
        let parsedMsg = '```';

        data.forEach((item) => {
          parsedMsg += `${item[0]}: ${item[1]}\n`;
        });

        rtm.sendMessage(`${parsedMsg}\`\`\``, message.channel);
      });
    });
  },
};
