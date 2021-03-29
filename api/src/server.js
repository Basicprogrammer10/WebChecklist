const rateLimit = require("express-rate-limit");
const express = require('express');
const path = require('path');
const fs = require('fs');

const config = require('./config.json');
const app = express();
app.use(rateLimit({windowMs: 10000, max: 100}));

app.get('/', function (req, res) {
    console.log(`🌐 GET: / ${req.ip}`);
    res.header('Access-Control-Allow-Origin','*'); //TODO: DEBUG
    res.send([{"name": "nose", "checked": true}, {"name": "dog", "checked": false}, {"name": ":)", "checked": true}]);
});

module.exports = {
    start: function () {
        app.listen(config.port, function () {
            console.log(`🐍 Serving http://localhost:${config.port}/`);
        });
    }
}