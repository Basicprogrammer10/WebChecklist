const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const express = require('express');
const snappy = require('snappy')
const fs = require('fs');

const hostName = '0.0.0.0';
const port = 8732;

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(rateLimit({
    message: '{"error": "Too Many Requests"}',
    windowMs: 30000,
    max: 1
}));

function getDateTime(date_ob) {
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let milliSeconds = date_ob.getMilliseconds();
    return `${year}-${month}-${date}_${hours}-${minutes}-${seconds}-${milliSeconds}`
}

app.post('/', function (req, res) {
    console.log(`[*] Request from ${req.ip}`);
    if (req.body.data === undefined) {
        res.send({error: "No Data Supplied"});
        return;
    }
    try {
        let buff = Buffer.from(req.body.data, 'base64');
        let text = buff.toString('utf-8');
        let compressed = snappy.compressSync(text);
        let dateTime = getDateTime(new Date());
        fs.writeFileSync(`data/${dateTime}.wcb`, new Buffer.from(compressed));
        console.log(`[*] Saved file ${dateTime}.wcb`);
        res.send({status: 'Saved Successfully', fileName: `${dateTime}.wcb`});
    } catch (e) {
        res.status(500).send({'error': 'Something bad happened :/'});
        console.log(e);
    }
});

if (!fs.existsSync('data')) fs.mkdirSync('data');
app.listen(port, hostName, function () {
    console.log(`[*] Serving http://${hostName}:${port}/\n`);
});