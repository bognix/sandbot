var RtmClient = require('@slack/client').RtmClient,
    token = process.env.SANDBOT_TOKEN || '',
    Promise = require('bluebird'),
    request = require('request'),
    rtm = new RtmClient(token, {logLevel: 'error'}),
    db = require('./db/connection');

    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    STATUS_PATTERN = /sandbot status/i,
    BOOK_PATTERN = /(biore|taking) (sandbox|adeng)-/i,
    RELEASE_PATTERN = /(zwalniam|releasing) (sandbox|adeng)-/i,
    PING_PATTERN = /sandbot (zyjesz|ping)\?/i;

console.log("Sandbot activated.");
rtm.start();
console.log("Slack RTM started.");

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    if (message.text && STATUS_PATTERN.test(message.text)) {
        console.log("Checking status...");

        getStatus(message.channel).then(function (data) {
            var promises = [];

            Object.keys(data.result).forEach(function (key) {
                promises.push(parseSandboxStatus(key, data.result[key]));
            });

            Promise.all(promises).then(function (data) {
                var parsedMsg = '```';
                data.forEach(function (item) {
                    parsedMsg += item[0] + ': ' + item[1] + '\n';
                });
                rtm.sendMessage(parsedMsg + '```', message.channel);
            })
        })
    }

    if (message.text && BOOK_PATTERN.test(message.text)) {
        var sandboxName = getSandboxNameFromMessage(message),
            msg = '<@' + message.user + '> ';

        getSandboxOwner(message.channel, sandboxName)
            .then(function (sandboxOwner) {
                if (sandboxOwner.result) {
                    msg += ':-1: - <@' + sandboxOwner.result + '> is using it';
                    rtm.sendMessage(msg, message.channel)
                } else {
                    bookSandbox(message)
                        .then(function () {
                            msg += ':+1:';
                            rtm.sendMessage(msg, message.channel)
                        })
                }
            });
    }

    if (message.text && RELEASE_PATTERN.test(message.text)) {
        releaseSandbox(message)
            .then(function (data) {
                if (data.response) {
                    rtm.sendMessage(data.response, message.channel);
                } else {
                    var msg = '<@' + message.user + '> :+1:';
                }
                rtm.sendMessage(msg, message.channel);
            })
    }

    if (message.text && PING_PATTERN.test(message.text)) {
        console.log("Pong.");
        rtm.sendMessage('no ba! zyje, ziom! :+1:', message.channel);
    }
});

function getStatus(channel) {
    return new Promise(function (resolve, reject) {
        db.all(
            "SELECT sandbox, owner FROM sandboxes WHERE team = $teamChannel",
            {$teamChannel: channel},
            function(err, rows) {
                if(err) {
                    reject(err);
                }

                var result = {};

                rows.forEach(function(row) {
                    if (row.sandbox) {
                        result[row.sandbox] = row.owner;
                    } else {
                        console.log('Invalid row.');
                    }
                });

                resolve({result: result});
            }
        );
    });
}

function getSandboxOwner(channel, sandboxName) {
    return new Promise(function (resolve, reject) {
        db.get(
            "SELECT owner FROM sandboxes WHERE team = $teamChannel AND sandbox = $sandboxName",
            {$teamChannel: channel, $sandboxName: sandboxName},
            function(err, row) {
                if(err) {
                    reject(err);
                }

                return resolve({result: row.owner});
            }
        );
    })
}

function bookSandbox(message) {
    var sandboxName = getSandboxNameFromMessage(message);

    console.log('Booking', sandboxName, 'for', message.user, 'on', message.channel);
    return new Promise(function (resolve, reject) {
        db.run(
            "UPDATE sandboxes SET owner = $userId WHERE team = $teamChannel AND sandbox = $sandboxName",
            {$userId: message.user, $teamChannel: message.channel, $sandboxName: sandboxName},
            function(err, row) {
                if(err) {
                    reject(err);
                }

                return resolve();
            }
        );
    });
}

function getUserNameById(userId) {
    return new Promise(function (resolve, reject) {
        request(
            {
                url: 'https://slack.com/api/users.info',
                qs: {
                    token: token,
                    user: userId
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var json = JSON.parse(body);
                    resolve(json.user.name);
                }
            })
    })
}

function getSandboxNameFromMessage(message) {
    var text = message.text,
        match = text.match(/((sandbox|adeng)-.*)/i);

    if (match) {
        return match[0];
    }
}

function parseSandboxStatus(key, value) {
    if (value) {
        return new Promise(function (resolve, reject) {
            getUserNameById(value)
                .then(function (userName) {
                    resolve([key, userName]);
                });
        });
    } else {
        return [key, 'free'];
    }
}

function updateDbWithRelease(sandboxName, channel) {
    return new Promise(function (resolve, reject) {
        db.run(
            "UPDATE sandboxes SET owner = '' WHERE team = $teamChannel AND sandbox = $sandboxName",
            {$teamChannel: channel, $sandboxName: sandboxName},
            function (err) {
                if (err) {
                    reject(err);
                }

                resolve();
            }
        );
    });
}

function releaseSandbox(message) {
    var sandboxName, response;

    return new Promise(function (resolve, reject) {
        sandboxName = getSandboxNameFromMessage(message);

        return getSandboxOwner(message.channel, sandboxName)
            .then(function (sandboxOwner) {
                if(sandboxOwner.result && sandboxOwner.result !== message.user) {
                    response = ':pirate: take over!!! <@' + sandboxOwner.result + '>, <@' + message.user + '> is releasing your sandbox! :pirate:';

                    return updateDbWithRelease(sandboxName, message.channel)
                        .then(function () {
                            resolve({
                                response: response,
                                data: {}
                            });
                        });
                } else {
                    return updateDbWithRelease(sandboxName, message.channel)
                        .then(function () {
                            resolve({
                                data: {}
                            });
                        });
                }
            });
    })
}

function exitHandler() {
    console.log("Closing connection to database.");
    db.close();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
