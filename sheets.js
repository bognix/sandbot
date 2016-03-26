var fs = require('fs'),
  readline = require('readline'),
  google = require('googleapis'),
  googleAuth = require('google-auth-library'),
  Promise = require('bluebird'),

  SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
  TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/',
  TOKEN_PATH = TOKEN_DIR + 'script-nodejs-quickstart.json',
  TOKEN_FILE_NAME = 'client_secret.json';

function auth() {
  return new Promise(function(resolve, reject) {
    fs.readFile(TOKEN_FILE_NAME, function processClientSecrets(err, content) {
      if (err) {
        return reject(err);
      }
      resolve(JSON.parse(content));
    });
  }).then(function(data) {
    return authorize(data);
  });
}

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret,
    clientId = credentials.installed.client_id,
    redirectUrl = credentials.installed.redirect_uris[0],
    auth = new googleAuth(),
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    return new Promise(function(resolve, reject) {
      fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
          resolve(getNewToken(oauth2Client, callback));
        } else {
          oauth2Client.credentials = JSON.parse(token);
          resolve(oauth2Client);
        }
      });
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Call an Apps Script function to list the folders in the user's root
 * Drive folder.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getStatus(auth) {
  return new Promise(function(resolve, reject) {
    var scriptId = process.env.SCRIPT_ID;
    var script = google.script('v1');
    script.scripts.run({
      auth: auth,
      resource: {
        function: 'status'
      },
      scriptId: scriptId,
      devMode: true
    }, function(err, resp) {
      if (err) {
        // The API encountered a problem before the script started executing.
        console.log('The API returned an error: ' + err);
        reject(err);
      }
      if (resp.error) {
        // The API executed, but the script returned an error.

        // Extract the first (and only) set of error details. The values of this
        // object are the script's 'errorMessage' and 'errorType', and an array
        // of stack trace elements.
        var error = resp.error.details[0];
        console.log('Script error message: ' + error.errorMessage);
        console.log('Script error stacktrace:');

        if (error.scriptStackTraceElements) {
          // There may not be a stacktrace if the script didn't start executing.
          for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
            var trace = error.scriptStackTraceElements[i];
            console.log('\t%s: %s', trace.function, trace.lineNumber);
          }
        }
        reject(resp.error);
      } else {
        resolve(resp.response);
      }
    });
  })
}

function bookSandbox(auth, sandbox, user) {
  return new Promise(function(resolve, reject) {
    var scriptId = 'Mld5i6mCCi19Ld88QrGHkGOjLyazDQoNt';
    var script = google.script('v1');
    script.scripts.run({
      auth: auth,
      resource: {
        function: 'putUser',
        parameters: [sandbox, user],
      },
      scriptId: scriptId,
      devMode: true
    }, function(err, resp) {
      if (err) {
        // The API encountered a problem before the script started executing.
        console.log('The API returned an error: ' + err);
        reject(err);
      }
      if (resp.error) {
        // The API executed, but the script returned an error.

        // Extract the first (and only) set of error details. The values of this
        // object are the script's 'errorMessage' and 'errorType', and an array
        // of stack trace elements.
        var error = resp.error.details[0];
        console.log('Script error message: ' + error.errorMessage);
        console.log('Script error stacktrace:');

        if (error.scriptStackTraceElements) {
          // There may not be a stacktrace if the script didn't start executing.
          for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
            var trace = error.scriptStackTraceElements[i];
            console.log('\t%s: %s', trace.function, trace.lineNumber);
          }
        }
        reject(resp.error);
      } else {
        resolve(resp.response);
      }
    });
  })
}

module.exports = {
  'authorize': auth,
  'getStatus': getStatus,
  'bookSandbox': bookSandbox
};