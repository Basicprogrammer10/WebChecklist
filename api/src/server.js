const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');

const config = require('./../config/config.json');
const app = express();
if (config.serveStatic) app.use(express.static('./../static'));
app.use(rateLimit({windowMs: 1000, max: 10}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

require('./routes')(app, config);

module.exports = {
    start: function () {
        app.listen(config.server.port, config.server.ip, function () {
            console.log(`🐍 Serving http://${config.server.ip}:${config.server.port}/`);
        });
    }
}