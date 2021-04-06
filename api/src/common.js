const config = require('./../config/config.json');
const fs = require('fs');

module.exports = {
    makeName: function (name) { return name.split('×')[0]; },
    makeCookie: function (name) {
        if (name === undefined) return undefined;
        let working = decodeURI(name);
        let lastChar = working[working.length-1];
        if (lastChar === ' ' || lastChar === '%20') working = working.slice(0, -1);
        return working;
    },
    saveAndSendWebSocket: function(oldFile, sockets, checklist, config) {
        fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
            if (err) return;
            sockets.forEach(s => s.send('{"type": "updateList", "checklist": "' + checklist + '", "data": ' + JSON.stringify(oldFile[checklist]) + '}'));
        });
    },
    pad: function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    },
    getLogFileName: function(format) {
        const today = new Date();
        const utcDay = today.getUTCDate();
        const utcMonth = today.getUTCMonth();
        const utcYear = today.getUTCFullYear();
        return format.replace('#', `${utcMonth}-${utcDay}-${utcYear}`);
    },
    addToLog: function (text) {
        let today = new Date();
        let datetime = `${this.pad(today.getHours(), 2)}:${this.pad(today.getMinutes(), 2)}:${this.pad(today.getSeconds(), 2)}`;

        if (!config.log.enabled) return;
        fs.appendFile(this.getLogFileName(config.log.log), `[${datetime}] ${text}` + '\n','utf8',
            function(err) {
            if (err) throw err;
        });
    },
    log: function (text) {
        console.log(text);
        this.addToLog(text);
    }
}