[![Build Status](https://travis-ci.org/nice-shot/node-mitm-servers.svg?branch=master)](https://travis-ci.org/nice-shot/node-mitm-servers)
[![Coverage Status](https://coveralls.io/repos/nice-shot/node-mitm-servers/badge.svg?branch=master)](https://coveralls.io/r/nice-shot/node-mitm-servers?branch=master)

# mitm-servers
Package for high level HTTP server mocking using [mitm] and [express]. It allows
making complex mock servers and APIs without actually running live servers in
your unit tests. It also simplifies the process by separating the mock servers
from the actual tests as oppose to libraries like [nock] and [sinon].

This library will not intercept standard HTTP requests or TCP connections to
anything other than the servers you define.

## Usage
Eace server you create will have to be attached to a specific address. A basic
mock will be:

```js
var mitmServers = require('mitm-servers');
var express = require('express');

var mockApp = express();
mockApp.use(express.static('test_static_google'));

mitmServers.addApp('google.com', mockApp);
```

Now, whenever you send a request to google.com, you will be routed to the files
in the `test_static_google` folder. For example:

```js
var request = require('supertest');

request('google.com')
  .get('/')
  .expect('<html><body>Fake google</body></html>')
;
```

## Functions
### addApp(hostname, app)
Starts intercepting requests to the given host and handling those requests with
the given express app.
* `hostname`: The target hostname as a string. You can also specific a port with
  `:`. For example: `localhost:1234`
* `app`: An app you've created with **express** or **connect**. Alternatively,
  you can use any function that handles an `http.IncomingMessage` and
  `http.ServerResponse`

### removeApp(hostname)
Removes interceptions from the given host.
* `hostname`: The target hostname as a string

### removeAllApps()
Removes interceptions for all the hosts. Convenient for teardown functions.

## HTTPS
If you need to mock a host that connections to it are sent with HTTPS you'll
need to specifiy the SSL port for it (443). For example:
```js
mitmServers.addApp('google.com:443', mockApp);
```

[mitm]: https://github.com/moll/node-mitm
[express]: http://expressjs.com/
[nock]: https://github.com/pgte/nock
[sinon]: http://sinonjs.org/
