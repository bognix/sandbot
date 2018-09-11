const db = require('./connection');
const channels = require('../channels');

db.serialize(() => {
  db.run(`INSERT INTO sandboxes VALUES('sandbox-sandbot1', '${channels.SANDBOT_TEST_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-sandbot2', '${channels.SANDBOT_TEST_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-sandbot3', '${channels.SANDBOT_TEST_CHANNEL_ID}', '');`);

  console.log('Sandbot sandboxes added.');

  db.close();
});
