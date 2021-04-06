const config = require('./../config/config.json');
const common = require('./common');
const server = require('./server');
const setup = require('./setup');

common.log(`🌠 Starting WebChecklist Server! v${config.version}`);
setup.setup();
if (config.server.ssl.enabled)  server.startSsl();
if (!config.server.ssl.enabled) server.start();