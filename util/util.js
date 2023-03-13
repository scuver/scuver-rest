const SimpleNodeLogger = require('simple-node-logger');
const os = require("os");
const fetch = require('node-fetch');
// const consolere = require('console-remote-client');
// consolere.connect({
//   channel: 'scuver'
// });

exports.UIDGenerator = class UIDGenerator {

  // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
  static lastPushTime = 0;

  // Modeled after base64 web-safe chars, but ordered by ASCII.
  static PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  // We generate 72-bits of randomness which get turned into 12 characters and appended to the
  // timestamp to prevent collisions with other clients.  We store the last characters we
  // generated because in the event of a collision, we'll use those same characters except
  // "incremented" by one.
  static lastRandChars = [];

  // Generates chronologically orderable unique string one by one
  static generate() {
    var now = new Date().getTime();
    var duplicateTime = (now === UIDGenerator.lastPushTime);
    UIDGenerator.lastPushTime = now;

    var timeStampChars = new Array(8);
    for (var i = 7; i >= 0; i--) {
      timeStampChars[i] = UIDGenerator.PUSH_CHARS.charAt(now % 64);
      // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
      now = Math.floor(now / 64);
    }
    if (now !== 0) throw new Error('We should have converted the entire timestamp.');

    var id = timeStampChars.join('');

    if (!duplicateTime) {
      for (i = 0; i < 12; i++) {
        UIDGenerator.lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
      for (i = 11; i >= 0 && UIDGenerator.lastRandChars[i] === 63; i--) {
        UIDGenerator.lastRandChars[i] = 0;
      }
      UIDGenerator.lastRandChars[i]++;
    }
    for (i = 0; i < 12; i++) {
      id += UIDGenerator.PUSH_CHARS.charAt(UIDGenerator.lastRandChars[i]);
    }
    if (id.length != 20) throw new Error('Length should be 20.');

    return id;
  }
}

const createLogger = (filePrefix, enableConsole) => {
  const manager = new SimpleNodeLogger();
  // if (enableConsole) {
    manager.createConsoleAppender();
  // }
  manager.createRollingFileAppender({
    logDirectory: `${os.homedir()}`,
    fileNamePattern: `${filePrefix}-<DATE>.log`,
    dateFormat: 'YYYY.MM.DD'
  });
  return manager.createLogger();
}

const logger = createLogger('scuver-service');
console.log = logger.info;
console.error = logger.error;
console.warn = logger.warn;
exports.logger = logger;

const httpCall = (args) => {

  console.log('httpCall', args)

  const method = args.method ? args.method.toUpperCase() : 'GET'

  // return new Promise(resolve => resolve());
  const headers = new fetch.Headers();
  if (args.headers) {
    args.headers.forEach((header) => {
      headers.append(header.name, header.value);
    });
  }
  if (args.isJSON) {
    headers.append('accept', 'application/json');
    headers.append('content-type', 'application/json');
  }

  const requestOptions = {
    method,
    headers,
    redirect: 'follow'
  };

  if (method !== 'GET' && method !== 'DELETE') {
    requestOptions.body = JSON.stringify(args.body || {});
  }

  return fetch(args.url, requestOptions)
    .then((response) => response[args.isJSONResponse ? 'json' : 'text']())
    .catch((error) => console.log(error));
};

// exports.log = (...value) => {
//   console.re.log(...value);
// }
