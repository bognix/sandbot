module.exports = {
  pattern: /sandbot (zyjesz|ping)\?/i,
  action(rtm, message) {
    console.log('Pong.');
    rtm.sendMessage('no ba! zyje, ziom! :+1:', message.channel);
  },
};
