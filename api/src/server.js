const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const config = require('./config.json');
const app = express();
app.use(rateLimit({windowMs: 10000, max: 100}));
app.use(bodyParser.json());

app.get('/api/getall', function (req, res) {
    console.log(`🌐 GET: /api/getall ${req.ip}`);

    fs.readFile(config.data, 'utf8' , (err, data) => {
        if (err) return;
        res.send(JSON.parse(data));
    });
});

app.post('/api/new', function (req, res) {
    console.log(`🌐 POST: /api/new ${req.ip}`);

    let item = {
        name: req.body.name,
        checked: req.body.checked
    }
    console.log(item);

    fs.readFile(config.data, 'utf8' , (err, data) => {
        if (err) return;
        let addNew = true;
        let oldFile = JSON.parse(data);

        oldFile.forEach(key => {
            if (key.name === item.name) {
                key.checked = item.checked;
                addNew = false;
            }
        });

        if (addNew) oldFile.push(item);

        fs.writeFile(config.data, JSON.stringify(oldFile), function (err) {
            if (err) return;
            console.log("🦈 Updated 'Database'");
        });
    })
    res.send();
});

module.exports = {
    start: function () {
        app.listen(config.port, function () {
            console.log(`🐍 Serving http://localhost:${config.port}/`);
        });
    }
}