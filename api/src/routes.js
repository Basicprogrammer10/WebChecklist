const {makeCookie, saveAndSendWebSocket, makeName} = require("./common");
const fs = require('fs');

module.exports = {
    rest: function (app) {
        app.post('/login', function (req, res) {
            console.log("🌐 Login Form: " + req.body.checklist.toLowerCase() + " IP: " + req.ip)
            res.cookie('checklist', makeCookie(req.body.checklist.toLowerCase()));
            res.redirect('/');
        });
    },
    webSocket: function (wsServer, config) {
        let sockets = [];
        wsServer.on('connection', socket => {
            if (!sockets.includes(socket)) console.log(`✔ WebSocket Connected IP: ${socket._socket.remoteAddress}`);
            socket.on('message', message => console.log("🔌 WebSocket: " + message + " IP: " + socket._socket.remoteAddress));
            sockets.push(socket);

            socket.on('message', function (msg) {
                let data = JSON.parse(msg);

                if (data['action'] === 'get') {
                    if (makeCookie(data['cookie']) === "undefined") {
                        socket.send(JSON.stringify({'logout': true}));
                        return;
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let oldFile = JSON.parse(FileData);
                        let checklist = makeCookie(data['cookie']);
                        if (oldFile[checklist] === undefined) {
                            socket.send(JSON.stringify({
                                data: {new: true, template: config.data.defaultData},
                                type: "updateList",
                                checklist: checklist
                            }));
                            oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.data.defaultData + '}'), oldFile);
                            fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
                                if (err) return;
                                console.log("🦈 Updated 'Database'");
                            });
                            return;
                        }

                        socket.send(JSON.stringify({
                            type: "updateList",
                            "checklist": checklist,
                            data: JSON.parse(FileData)[makeCookie(data['cookie'])]
                        }));
                    });
                }

                if (data['action'] === 'update') {
                    let item = {
                        name: makeName(data.data.name),
                        checked: data.data.checked
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let addNew = true;
                        let checklist = makeCookie(data['cookie']);
                        let oldFile = JSON.parse(FileData);

                        if (oldFile[checklist] === undefined) oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.data.defaultData + '}'), oldFile);

                        oldFile[checklist].forEach(key => {
                            if (key.name === item.name) {
                                key.checked = item.checked;
                                addNew = false;
                            }
                        });

                        if (addNew) oldFile[checklist].push(item);
                        saveAndSendWebSocket(oldFile, sockets, checklist, config);
                    });
                }

                if (data['action'] === 'delete') {
                    let checklist = makeCookie(data['cookie']);
                    let item = {
                        name: data.data.name
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let oldFile = JSON.parse(FileData);

                        oldFile[checklist].forEach(function (key, index, object) {
                            if (key.name === item.name) {
                                object.splice(index, 1);
                            }
                        });
                        saveAndSendWebSocket(oldFile, sockets, checklist, config);
                    })
                }
            });

            socket.on('close', function () {
                console.log(`❌ WebSocket Disconnected IP: ${socket._socket.remoteAddress}`)
                sockets = sockets.filter(s => s !== socket);
            });
        });
    }
}