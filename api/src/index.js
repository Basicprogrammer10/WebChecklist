const config = require('./../config/config.json');
const common = require('./common');
const server = require('./server');
const setup = require('./setup');

common.log(`🌠 Starting WebChecklist Server! v${config.version}`);
setup.setup();
if (config.server.tls.enabled)  server.startTls();
if (!config.server.tls.enabled) server.start();