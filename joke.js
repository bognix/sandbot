const request = require('request');

module.exports = {
  pattern: /sandbot joke/i,
  action(rtm, message) {
    request(
      {
        url: 'http://api.icndb.com/jokes/random',
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const json = JSON.parse(body);

          rtm.sendMessage(json.value.joke, message.channel);
        }
      },
    );
  },
};
