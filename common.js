const db = require('./db/connection');

module.exports = {
  getSandboxNameFromMessage({ text }) {
    const match = text.match(/((sandbox|adeng)-.*)/i);

    if (match) {
      return match[0];
    }

    return undefined;
  },

  getSandboxOwner(channel, sandboxName) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT owner FROM sandboxes WHERE team = $teamChannel AND sandbox = $sandboxName',
        { $teamChannel: channel, $sandboxName: sandboxName },
        (err, row) => {
          if (err || !row) {
            return reject(err || 'sandbox does not exist');
          }

          return resolve({ result: row.owner });
        },
      );
    });
  },
};
