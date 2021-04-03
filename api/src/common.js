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
        console.log("🦈 Updated 'Database'");
        sockets.forEach(s => s.send('{"type": "updateList", "checklist": "' + checklist + '", "data": ' + JSON.stringify(oldFile[checklist]) + '}'));
    });
}
}