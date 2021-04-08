const config = require('./../config/config.json');
const common = require('./common');
const fs = require('fs');

function createDataFile() {
    fs.writeFile(config.data.data, config.data.defaultData, { flag: 'wx' }, function (err) {
        if (err) return;
        common.log("📁 Created 'Database'");
    });
}

module.exports = {
    setup: function () {
        createDataFile();
    }
}