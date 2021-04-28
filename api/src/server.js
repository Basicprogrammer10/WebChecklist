const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const ws = require("ws");
const fs = require('fs');

const wsServer = new ws.Server({noServer: true});
const config = require('./../config/config.json');
const common = require("./common");
const app = express();
if (config.server.static.serveStatic) app.use(express.static(config.server.static.staticFolder));
if (config.server.rateLimit.enabled) app.use(rateLimit({
    windowMs: config.server.rateLimit.window,
    max: config.server.rateLimit.max
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

module.exports = {
    init: function (plugins) {
        let loadDefault = true;
        for (const key in plugins) {
            if ('disableDefaultApi' in plugins[key])
                if (plugins[key].disableDefaultApi) loadDefault = false;
            if ('api' in plugins[key]) {
                for (const fun in plugins[key].api) {
                    plugins[key].api[fun](app, wsServer, config);
                }
            }
        }
        if (!loadDefault) return;
        require('./routes').webSocket(wsServer, config);
        require('./routes').rest(app, config);
    },

    start: function () {
        app.listen(config.server.port, config.server.ip, function () {
            common.log(`🐍 Serving http://${config.server.ip}:${config.server.port}/`);
        })
            .on('upgrade', (request, socket, head) => {
                wsServer.handleUpgrade(request, socket, head, socket => {
                    wsServer.emit('connection', socket, request);
                    common.log(`✔ WebSocket Connected`, '', socket._socket.remoteAddress);
                });
            });

    },

    startTls: function () {
        https.createServer({
            key: fs.readFileSync(config.server.tls.key),
            cert: fs.readFileSync(config.server.tls.cert)
        }, app)
            .listen(config.server.port, config.server.ip, function () {
                common.log(`🐍 Serving https://${config.server.ip}:${config.server.port}/`);
            })
            .on('upgrade', (request, socket, head) => {
                wsServer.handleUpgrade(request, socket, head, socket => {
                    wsServer.emit('connection', socket, request);
                    common.log(`✔ WebSocket Connected`, '', socket._socket.remoteAddress);
                });
            });
    }
}