var test = require('tape');
var http = require('http');
var express = require('express');
var Promise = require('bluebird');
var request = require('supertest');
Promise.promisifyAll(request);

var mitmServers = require('..');

test('Mock Google', function (t) {
  t.plan(2);

  var staticApp = express();
  staticApp.use(express.static('test/static_sample'));

  mitmServers.addApp('google.com', staticApp);

  request('google.com')
    .get('/')
    .expect(200)
    .expect('<html><body>Fake Google!</body></html>\n')
    .end(function (err) {
      t.error(err, 'Google as static app');
    })
  ;

  request('google.com')
    .get('/missing_page.html')
    .expect(404)
    .end(function (err) {
      t.error(err, 'Missing static page returns 404');
    })
  ;

  mitmServers.removeApp('google.com');
});

test('Mock localhost', function (t) {
  var mockedApp = express();
  mockedApp.get('/', function (req, res) {
    res.send('hello!');
  });

  var liveApp = express();
  liveApp.get('/', function (req, res) {
    res.send('again!');
  });
  var liveServer = http.createServer(liveApp);
  Promise.promisifyAll(liveServer);

  function addMock() {
    mitmServers.addApp('localhost:1234', mockedApp);
  }

  function requestServer () {
    return request('localhost:1234')
      .get('/')
      .endAsync()
    ;
  }

  liveServer.listenAsync(1234)
    .then(addMock)
    .then(requestServer)
    .then(function (res) {
      t.equal(res.text, 'hello!', 'Mocked server takes precedence');
      mitmServers.removeApp('localhost:1234');
    })
    .then(requestServer)
    .then(function (res) {
      t.equal(res.text, 'again!', 'Mocks are removed properly with removeApp');
    })
    .then(addMock)
    .then(requestServer)
    .then(function (res) {
      t.equal(res.text, 'hello!', 'Mock can be used again');
    })
    .then(function () {
      mitmServers.removeAllApps();
    })
    .then(requestServer)
    .then(function(res) {
      t.equal(
        res.text,
        'again!',
        'Mocks are removed properly with removeAllApps'
      );
    })
    .finally(function () {
      liveServer.closeAsync()
        .finally(t.end)
      ;
    })
  ;
});

test('Validations', function (t) {
  t.plan(3);

  t.throws(
    function () {
      mitmServers.addApp();
    },
    /hostname is required/,
    'No hostname'
  );

  t.throws(
    function () {
      mitmServers.addApp('domain.com');
    },
    /app must exist and be a function/,
    'No express app'
  );

  t.throws(
    function () {
      mitmServers.addApp('domain.com', 'banana');
    },
    /app must exist and be a function/,
    'Bad express app'
  );
});
