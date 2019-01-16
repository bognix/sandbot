const db = require('./connection');
const channels = require('../channels');

db.serialize(() => {
  db.run(`INSERT INTO sandboxes VALUES('sandbox-adeng06', '${channels.ADENG_CHANNEL_ID}', '');`);
  db.run(`INSERT INTO sandboxes VALUES('sandbox-adeng07', '${channels.ADENG_CHANNEL_ID}', '');`);

  console.log('AdEng sandboxes 06 and 07 added.');

  db.close();
});
