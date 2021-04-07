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
app.use(rateLimit({windowMs: 1000, max: 10}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

require('./routes').webSocket(wsServer, config);
require('./routes').rest(app, config);

module.exports = {
    start: function () {
        app.listen(config.server.port, config.server.ip, function () {
            console.log(`🐍 Serving http://${config.server.ip}:${config.server.port}/`);
        })
            .on('upgrade', (request, socket, head) => {
                wsServer.handleUpgrade(request, socket, head, socket => {
                    wsServer.emit('connection', socket, request);
                    common.log(`✔ WebSocket Connected IP: ${socket._socket.remoteAddress}`);
                });
            });

    },

    startTls: function () {
        https.createServer({
            key: fs.readFileSync(config.server.tls.key),
            cert: fs.readFileSync(config.server.tls.cert)
        }, app)
            .listen(config.server.port, config.server.ip, function () {
                console.log(`🐍 Serving https://${config.server.ip}:${config.server.port}/`);
            })
            .on('upgrade', (request, socket, head) => {
                wsServer.handleUpgrade(request, socket, head, socket => {
                    wsServer.emit('connection', socket, request);
                    common.log(`✔ WebSocket Connected IP: ${socket._socket.remoteAddress}`);
                });
            });
    }
}