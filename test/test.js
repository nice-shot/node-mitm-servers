var test = require('tape');
var express = require('express');
var request = require('supertest');

var mitmServers = require('..');

test('mitm servers', function (t) {
  t.plan(2);

  var staticApp = express();
  staticApp.use(express.static('static_sample'));

  mitmServers.addApp('google.com', staticApp);

  request('google.com')
    .get('/')
    .expect(200)
    .expect('<html><body>Fake Google!</body></html>\n')
    .end(function (err) {
      t.error(err, 'Google as static app')
    })
  ;

  request('google.com')
    .get('/missing_page.html')
    .expect(404)
    .end(function (err) {
      t.error(err, 'Missing static page returns 404');
    })
  ;

});
