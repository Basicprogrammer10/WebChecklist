const server = require('./server');
const setup = require('./data');

setup.setup();
server.start();