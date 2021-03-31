const config = require('./../config/config.json');
const server = require('./server');
const setup = require('./data');

setup.setup();
if (config.server.ssl.enabled)  server.startSsl();
if (!config.server.ssl.enabled) server.start();