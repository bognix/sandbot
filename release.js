const Promise = require('bluebird');
const { getSandboxNameFromMessage, getSandboxOwner } = require('./common');
const db = require('./db/connection');

function updateDbWithRelease(sandboxName, channel) {
  return new Promise(((resolve, reject) => {
    db.run(
      "UPDATE sandboxes SET owner = '' WHERE team = $teamChannel AND sandbox = $sandboxName",
      { $teamChannel: channel, $sandboxName: sandboxName },
      (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      },
    );
  }));
}

function releaseSandbox(message) {
  let response;
  let sandboxName;

  return new Promise(((resolve) => {
    sandboxName = getSandboxNameFromMessage(message);

    return getSandboxOwner(message.channel, sandboxName)
      .then((sandboxOwner) => {
        if (sandboxOwner.result && sandboxOwner.result !== message.user) {
          response = `:pirate: take over!!! <@${sandboxOwner.result}>, <@${message.user}> is releasing your sandbox! :pirate:`;

          return updateDbWithRelease(sandboxName, message.channel)
            .then(() => {
              resolve({
                response,
                data: {},
              });
            });
        }

        return updateDbWithRelease(sandboxName, message.channel)
          .then(() => {
            resolve({
              data: {},
            });
          });
      });
  }));
}

module.exports = {
  pattern: /(zwalniam|releasing) (sandbox|adeng)-/i,
  action(rtm, message) {
    releaseSandbox(message)
      .then((data) => {
        if (data.response) {
          rtm.sendMessage(data.response, message.channel);
        } else {
          rtm.sendMessage(`<@${message.user}> :+1:`, message.channel);
        }
      })
      .catch((err) => {
        rtm.sendMessage(`:x: sandbot error: \`${err}\`, try again`, message.channel);
      });
  },
};
