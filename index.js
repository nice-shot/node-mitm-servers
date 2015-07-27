var util = require('util');
var mitm = require('mitm')();

var hostHandlers = {};

/** Avoids intercepting non handled hosts */
mitm.on('connect', function handleConnections (socket, opts) {
  var hostname = util.format('%s:%d', opts.host, opts.port);
  if (!(hostname in hostHandlers)) {
    socket.bypass();
  }
});

/**
 * Makes sure all hostnames have a specific port. Used for indexing
 * NOTE! Doesn't support IPv6
 * @param hostname
 */
function addPort (hostname) {
  if (hostname.split(':').length !== 2) {
    hostname += ':80';
  }
  return hostname;
}

/** Handles each request with the appropriate response */
mitm.on('request', function (req, res) {
  var hostname = addPort(req.headers.host);

  if (!(hostname in hostHandlers)) {
    throw new Error('Handling request to non handled host: ' + hostname);
  }

  hostHandlers[hostname](req, res);
});

/**
 * Adds a new host to handle with the given app
 * @param hostname
 * @param app
 */
exports.addApp = function (hostname, app) {
  if (!hostname) {
    throw new TypeError('hostname is required');
  }

  if (!app || typeof app !== 'function') {
    throw new TypeError('app is required to be a function');
  }

  hostHandlers[addPort(hostname)] = app;
};

/**
 * Removes handling for the given host. Requests to this host will not be
 * interrupted anymore
 * @param hostname
 */
exports.removeApp = function (hostname) {
  delete hostHandlers[hostname];
};

/** Removes all handlers for all hosts */
exports.removeAllApps = function () {
  hostHandlers = {};
};
