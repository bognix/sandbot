const db = require('./connection');
const channels = require('../channels');

db.serialize(() => {
  db.run("DELETE FROM sandboxes WHERE sandbox = 'adeng-fandom';");
  db.run(`INSERT INTO sandboxes VALUES('sandbox-adeng', '${channels.ADENG_CHANNEL_ID}', '');`);

  console.log('AdEng sandbox renamed: adeng-fandom -> sandbox-adeng.');

  db.close();
});
