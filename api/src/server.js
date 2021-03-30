const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const config = require('./config.json');
const app = express();
if (config.serveStatic) app.use(express.static('./../static'));
app.use(rateLimit({windowMs: 1000, max: 10}));
app.use(bodyParser.json());

app.get('/api', function (req, res) {
    console.log(`[${debugTime()}] 🌐 GET: /api ${req.ip}`);

    fs.readFile(config.data, 'utf8' , (err, data) => {
        if (err) return;
        res.send(JSON.parse(data));
    });
});

app.post('/api', function (req, res) {
    console.log(`[${debugTime()}] 🌐 POST: /api ${req.ip}`);

    let item = {
        name: makeName(req.body.name),
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

app.delete('/api', function (req, res) {
    console.log(`[${debugTime()}] 🌐 DELETE: /api ${req.ip}`);

    let item = {
        name: req.body.name
    }
    console.log(item);

    fs.readFile(config.data, 'utf8' , (err, data) => {
        if (err) return;
        let oldFile = JSON.parse(data);

        oldFile.forEach(function(key, index, object) {
            if (key.name === item.name) {
                object.splice(index, 1);
            }
        });

        fs.writeFile(config.data, JSON.stringify(oldFile), function (err) {
            if (err) return;
            console.log("🦈 Updated 'Database'");
        });
    })
    res.send();
});

function makeName(name) { return name.split('×')[0]; }
function debugTime() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); }

module.exports = {
    start: function () {
        app.listen(config.port, '0.0.0.0', function () {
            console.log(`🐍 Serving http://localhost:${config.port}/`);
        });
    }
}