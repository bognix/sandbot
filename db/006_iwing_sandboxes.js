const db = require('./connection');
const channels = require('../channels');

db.serialize(() => {
  db.run(`INSERT INTO sandboxes VALUES('sandbox-dedicated', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-xw1', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-xw2', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-so', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-mercury', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-content', '${channels.IWING_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-qa01', '${channels.IRIS_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-qa02', '${channels.IRIS_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-qa03', '${channels.IRIS_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-qa04', '${channels.IWING_CHANNEL_ID}', '');`);

  console.log('I-Wing sandboxes added.');

  db.close();
});
