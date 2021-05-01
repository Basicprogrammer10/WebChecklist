const config = require('./../config/config.json');
const common = require('./common');
const fs = require('fs');

function createDataFile(start, end) {
    let folder = config.data.data.substring(0, config.data.data.lastIndexOf("/"));
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    fs.writeFile(config.data.data, config.data.defaultData, { flag: 'wx' }, function (err) {
        if (err) return;
        common.log("📁 Created 'Database'");
        common.log("⛑ Restart Server for Database to be loaded");
        process.exit(0);
    });
}

function createLogFolder() {
    let dir = 'log';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        common.log("📜 Created Log Folder");
    }
}

module.exports = {
    setup: function () {
        createDataFile();
        createLogFolder();
    }
}