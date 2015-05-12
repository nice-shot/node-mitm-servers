# mitm-servers
This package allows high level HTTP server mocking using [mitm](https://github.com/moll/node-mitm mitm)
and [express](http://expressjs.com/). It allows making complex mock servers and APIs without actually
running live servers in your unit tests. It also simplifies the process by separating the mock servers
from the actual as oppose to libraries like [nock](https://github.com/pgte/nock) and [sinon]
(http://sinonjs.org/).
And one more thing - this library will not intercept standard HTTP requests or TCP connections to anything
other than the servers you define.
