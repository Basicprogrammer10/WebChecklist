// Automatically backup Data File
// 5/2/2021 Connor Slade

const config = require('./../config/config.json');
const common = require('../src/common');
const http = require('http')
const fs = require('fs');

// Config
const localConfig = {
    backupOnStartup: false, // Backup on init
    backupOnDelay: false, // Backup every n days (use false to disable this timing method)
    ifTime: '1:36', // Backup if current time is hh:mm (ex 1:30)
    backupServer: {
        hostname: '127.0.0.1', // Hostname for server running the backup system
        port: 8080 // Backup system port
    }
};

// Check if it is time to run a function
function checkIfTime(dt, callback) {
    let dat = dt.split(':');
    let date = new Date();
    if (`${dat[0]}:${dat[1]}` === `${date.getHours()}:${date.getMinutes()}`) callback()
}

// Try to send a post request
function tryPost(serverConfig, data, callback) {
    const options = {
        hostname: serverConfig.hostname,
        port: serverConfig.port,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const req = http.request(options, res => res.on('data', d => callback(d, '')));
        req.on('error', error => common.log(`💽 Backup Error - ${error}`));
        req.write(data)
        req.end()
    }
    catch (e) {
        callback('', e);
    }
}

// Start the backup
function doBackup(serverConfig){
    common.log('💽 Starting Backup');
    let data = fs.readFileSync(config.data.data, "utf8");
    let base64 = Buffer.from(data).toString('base64');
    let toSend = JSON.stringify({data: base64});
    tryPost(serverConfig, toSend, (data, error) => {
        if (error) {
            common.log(`💽 Backup Error - ${error}`);
            return;
        }
        let jsonData = JSON.parse(data);
        if (Object.keys(jsonData).includes('error')) {
            common.log(`💽 Backup Error - ${jsonData.error}`);
            return;
        }
        common.log(`💽 Backup Complete - ${jsonData.fileName}`);
    });
}

module.exports = {
    loadThis: true,
    name: 'Auto Backup Database',
    version: '0.22',
    disableDefaultApi: false,

    // Init Plugin
    onInit: function () {
        let serverConfig = {hostname: localConfig.backupServer.hostname, port: localConfig.backupServer.port};
        if (localConfig.backupOnStartup) doBackup(serverConfig);
        if (!!localConfig.backupOnDelay){
            setInterval(doBackup, 86400000 * localConfig.backupOnDelay);
            return;
        }
        if (!!localConfig.ifTime){
            setInterval(() => {checkIfTime(localConfig.ifTime,() => {doBackup(serverConfig)})},50000)
        }
    }
}