var test = require('tape');
var http = require('http');
var express = require('express');
var request = require('supertest');

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
  liveServer = http.createServer(liveApp);

  liveServer.listen(1234, function () {
    mitmServers.addApp('localhost:1234', mockedApp);
    request('localhost:1234')
      .get('/')
      .expect('hello!')
      .end(function (err) {
        t.error(err, 'Mock take precedence to live servers');
        mitmServers.removeApp('localhost:1234');
        request('localhost:1234')
          .get('/')
          .expect('again!')
          .end(function (err) {
            t.error(err, 'Mocks are removed properly');
            liveServer.close(t.end);
          })
        ;
      })
    ;
  });
});

test('Validations', function (t) {
  t.end();
});
