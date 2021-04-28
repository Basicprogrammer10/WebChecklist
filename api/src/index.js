const config = require('./../config/config.json');
const pluginLoader = require('./pluginLoader');
const common = require('./common');
const server = require('./server');
const setup = require('./setup');

common.log(`🌠 Starting WebChecklist Server! v${config.version}`);
setup.setup();
server.init(pluginLoader.load('plugins'));
if (config.server.tls.enabled) server.startTls();
if (!config.server.tls.enabled) server.start();