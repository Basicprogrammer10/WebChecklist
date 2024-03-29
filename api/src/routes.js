const common = require("./common");
const uuid = require('uuid');
const fs = require('fs');

module.exports = {
    rest: function (app) {
        app.post('/login', function (req, res) {
            common.log("🌐 Login Form", req.body.checklist.toLowerCase(), req.ip);
            res.cookie('checklist', common.makeCookie(req.body.checklist.toLowerCase()));
            res.redirect('/');
        });
    },
    webSocket: function (wsServer, config) {
        let sockets = [];
        wsServer.on('connection', socket => {
            socket.on('message', message => common.log("🔌 WebSocket", message, socket._socket.remoteAddress));
            sockets.push(socket);

            socket.on('message', function (msg) {
                let data = JSON.parse(msg);

                if (data['action'] === 'get') {
                    if (common.makeCookie(data['cookie']) === "undefined") {
                        socket.send(JSON.stringify({'logout': true}));
                        return;
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let oldFile = JSON.parse(FileData);
                        let checklist = common.makeCookie(data['cookie']);
                        if (oldFile[checklist] === undefined) {
                            if (!config.settings.allowCreatingPages) {
                                socket.send(JSON.stringify({'logout': true}));
                                return;
                            }

                            let newData = config.data.defaultData;
                            while (newData.includes("$$")) {
                                newData = newData.replace("$$", uuid.v4());
                            }

                            socket.send(JSON.stringify({                                
                                data: {new: true, template: newData},
                                type: "updateList",
                                checklist: checklist
                            }));
                            oldFile = Object.assign({checklist: newData}, oldFile);
                            fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
                                if (err) return;
                                common.log("🦈 Updated 'Database'");
                            });
                            return;
                        }

                        socket.send(JSON.stringify({
                            type: "updateList",
                            "checklist": checklist,
                            data: JSON.parse(FileData)[common.makeCookie(data['cookie'])]
                        }));
                    });
                }

                if (data['action'] === 'update') {
                    let item = {
                        id: uuid.v4(),
                        name: common.makeName(data.data.name),
                        checked: data.data.checked
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let addNew = true;
                        let checklist = common.makeCookie(data['cookie']);
                        let oldFile = JSON.parse(FileData);

                        if (oldFile[checklist] === undefined) oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.data.defaultData + '}'), oldFile);

                        oldFile[checklist].forEach(key => {
                            if (key.name === item.name) {
                                key.checked = item.checked;
                                addNew = false;
                            }
                        });

                        if (addNew) oldFile[checklist].push(item);
                        common.saveAndSendWebSocket(oldFile, sockets, checklist, config);
                    });
                }

                if (data['action'] === 'delete') {
                    let checklist = common.makeCookie(data['cookie']);
                    let item = {
                        name: common.makeName(data.data.name)
                    }

                    fs.readFile(config.data.data, 'utf8', (err, FileData) => {
                        if (err) return;
                        let oldFile = JSON.parse(FileData);

                        oldFile[checklist].forEach(function (key, index, object) {
                            if (key.name === item.name) {
                                object.splice(index, 1);
                            }
                        });
                        common.saveAndSendWebSocket(oldFile, sockets, checklist, config);
                    })
                }
            });

            socket.on('close', function () {
                common.log(`❌ WebSocket Disconnected`, '', socket._socket.remoteAddress);
                sockets = sockets.filter(s => s !== socket);
            });
        });
    }
}