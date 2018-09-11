const { getSandboxNameFromMessage, getSandboxOwner } = require('./common');
const db = require('./db/connection');

function bookSandbox(message) {
  const sandboxName = getSandboxNameFromMessage(message);

  console.log('Booking', sandboxName, 'for', message.user, 'on', message.channel);
  return new Promise(((resolve, reject) => {
    db.run(
      'UPDATE sandboxes SET owner = $userId WHERE team = $teamChannel AND sandbox = $sandboxName',
      { $userId: message.user, $teamChannel: message.channel, $sandboxName: sandboxName },
      (err) => {
        if (err) {
          reject(err);
        }

        return resolve();
      },
    );
  }));
}

module.exports = {
  pattern: /(biore|taking) (sandbox|adeng)-/i,
  action(rtm, message) {
    const sandboxName = getSandboxNameFromMessage(message);
    let msg = `<@${message.user}> `;

    getSandboxOwner(message.channel, sandboxName)
      .then((sandboxOwner) => {
        if (sandboxOwner.result) {
          msg += `:-1: - <@${sandboxOwner.result}> is using it`;
          rtm.sendMessage(msg, message.channel);
        } else {
          bookSandbox(message)
            .then(() => {
              msg += ':+1:';
              rtm.sendMessage(msg, message.channel);
            });
        }
      })
      .catch((err) => {
        rtm.sendMessage(`:x: sandbot error: \`${err}\`, try again`, message.channel);
      });
  },
};
