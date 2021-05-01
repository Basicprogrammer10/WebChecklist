// WebChecklist Plugin to redirect http traffic to https
// Most useful if you have tls enabled in config.json

const rateLimit = require("express-rate-limit");
const express = require('express');

const common = require("../src/common");

// Config for this Server
// (This starts another web server and uses it to redirect traffic)
const localConfig = {
    ip: '0.0.0.0',
    port: 80,
    rateLimit: {
        enabled: true,
        window: 15000,
        max: 5
    }
};

module.exports = {
    loadThis: true,
    name: "Add HTTP support for https servers",
    version: "0.14",
    disableDefaultApi: false,

    // Start WebServer on plugin load
    onInit: function () {
        const httpServer = express();
        if (localConfig.rateLimit.enabled) httpServer.use(rateLimit({
            windowMs: localConfig.rateLimit.window,
            max: localConfig.rateLimit.max
        }));

        httpServer.get("*", function(req, res){
            common.log('🏮 Redirecting Http Traffic', '', req.ip);
            res.redirect("https://" + req.headers.host + req.url);
        }).listen(localConfig.port, localConfig.ip, function () {
            common.log(`🐍 Serving http://${localConfig.ip}:${localConfig.port}/`);
        });

    }
};