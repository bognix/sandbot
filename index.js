var RtmClient = require('@slack/client').RtmClient,
    token = process.env.SANDBOT_TOKEN || '',
    //sheet = require('./sheets'),
    Promise = require('bluebird'),
    request = require('request'),
    rtm = new RtmClient(token, {logLevel: 'error'}),
    //auth = sheet.authorize(),

    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:'),

    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    STATUS_PATTERN = /sandbot status/i,
    BOOK_PATTERN = /(biore|taking) (sandbox|adeng)-/i,
    RELEASE_PATTERN = /(zwalniam|releasing) (sandbox|adeng)-/i,
    PING_PATTERN = /sandbot (zyjesz|ping)\?/i;

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS sandboxes(sandbox TEXT PRIMARY KEY ASC, team TEXT, owner TEXT);");

    // Ad Engineering = G0GV00TC4
    db.run("INSERT INTO sandboxes VALUES('sandbox-adeng01', 'G0GV00TC4', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-adeng02', 'G0GV00TC4', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-adeng03', 'G0GV00TC4', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-adeng04', 'G0GV00TC4', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-adeng05', 'G0GV00TC4', '');");
    db.run("INSERT INTO sandboxes VALUES('adeng-fandom', 'G0GV00TC4', '');");

    // X-Wing = C053B0DC2
    db.run("INSERT INTO sandboxes VALUES('sanbox-dedicated', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-xw1', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-xw2', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-so', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-qa04', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-mercury', 'C053B0DC2', '');");
    db.run("INSERT INTO sandboxes VALUES('sandbox-content', 'C053B0DC2', '');");

    //db.each("SELECT sandbox, team, owner FROM sandboxes", function(err, row) {
    //    console.log(row.team + "> " + row.sandbox + ": " + row.owner);
    //});
});

db.close();

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function (message) {

    //if (message.text && STATUS_PATTERN.test(message.text)) {
    //
    //    getStatus(message.channel).then(function (data) {
    //        var promises = [];
    //
    //        Object.keys(data.result).forEach(function (key) {
    //            promises.push(parseSandboxStatus(key, data.result[key]));
    //        });
    //
    //        Promise.all(promises).then(function (data) {
    //            var parsedMsg = '```';
    //            data.forEach(function (item) {
    //                parsedMsg += item[0] + ': ' + item[1] + '\n';
    //            });
    //            rtm.sendMessage(parsedMsg + '```', message.channel);
    //        })
    //    })
    //}
    //
    //if (message.text && BOOK_PATTERN.test(message.text)) {
    //    var sandboxName = getSandboxNameFromMessage(message),
    //        msg = '<@' + message.user + '> ';
    //
    //    getPreviousUser(message.channel, sandboxName)
    //        .then(function (previousUser) {
    //            if (previousUser.result) {
    //                msg += ':-1: - <@' + previousUser.result + '> is using it';
    //                rtm.sendMessage(msg, message.channel)
    //            } else {
    //                bookSandbox(message)
    //                    .then(function () {
    //                        msg += ':+1:';
    //                        rtm.sendMessage(msg, message.channel)
    //                    })
    //            }
    //        });
    //}
    //
    //if (message.text && RELEASE_PATTERN.test(message.text)) {
    //    releaseSandbox(message)
    //        .then(function (data) {
    //            if (data.response) {
    //                rtm.sendMessage(data.response, message.channel);
    //            } else {
    //                var msg = '<@' + message.user + '> :+1:';
    //            }
    //            rtm.sendMessage(msg, message.channel)
    //        })
    //}

    if (message.text && PING_PATTERN.test(message.text)) {
        rtm.sendMessage('zyje :+1:', message.channel);
    }
});

function getStatus(channel) {
    return new Promise(function (resolve, reject) {
        auth
            .then(function (authData) {
                return sheet.getStatus(authData, channel);
            })
            .then(function (data) {
                resolve(data)
            });
    });
}

function getPreviousUser(channel, sandboxName) {
    return new Promise(function (resolve, reject) {
        auth
            .then(function (authData) {
                return sheet.getCurrentUser(authData, channel, sandboxName);
            })
            .then(function (data) {
                resolve(data);
            })
    })
}

function bookSandbox(message) {
    var sandboxName = getSandboxNameFromMessage(message);

    return new Promise(function (resolve, reject) {
        auth
            .then(function (authData) {
                return sheet.bookSandbox(authData, message.channel, sandboxName, message.user);
            })
            .then(function (data) {
                resolve(data)
            })
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

    console.log(match);
    if (match) {
        return match[0].replace('-', '_');
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

function releaseSandbox(message) {
    var authorization, response, sandboxName;

    return new Promise(function (resolve, reject) {
        auth
            .then(function (authData) {
                authorization = authData;
                sandboxName = getSandboxNameFromMessage(message);

                return sheet.getCurrentUser(authData, message.channel, sandboxName);
            })
            .then(function (data) {
                if (data.result && data.result !== message.user) {
                    response = ':pirate: take over!!! <@' + data.result + '>, <@' + message.user + '> is releasing your sandbox!:pirate:';
                }

                return sheet.releaseSandbox(authorization, message.channel, sandboxName, message.user);
            })
            .then(function (data) {
                resolve({
                    response: response,
                    data: data
                });
            });
    })
}
