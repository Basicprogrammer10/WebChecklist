const fs = require('fs');
const config = require('./config.json');

function createDataFile() {
    fs.writeFile(config.data, config.defaultData, { flag: 'wx' }, function (err) {
        if (err) return;
        console.log("📁 Created 'Database'");
    });
}

module.exports = {
    setup: function () {
        createDataFile();
    }
}