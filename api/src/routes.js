const {makeCookie, debugTime, makeName} = require("./common");
const fs = require('fs');

module.exports = {
    rest: function(app, config) {
        app.post('/login', function (req, res) {
            console.log(`[${debugTime()}] 🌐 POST: /login ${req.ip}`);
            console.log(req.body);

            res.cookie('checklist', makeCookie(req.body.checklist.toLowerCase()));
            res.redirect('/');
        });
    },
    webSocket: function(wsServer, config) {
        let sockets = [];
        wsServer.on('connection', socket => {
            socket.on('message', message => console.log("🔌 WebSocket: " + message));

            sockets.push(socket);

            socket.on('message', function(msg) {
                let data = JSON.parse(msg);

                if (data['action'] === 'get') {
                    console.log(`[${debugTime()}] 🌐 GET: /api`);
                    console.log(makeCookie(data['cookie']));

                    if (makeCookie(data['cookie']) === "undefined") {
                        socket.send(JSON.stringify({'logout': true}));
                        return;
                    }
                    fs.readFile(config.data.data, 'utf8' , (err, filedata) => {
                        if (err) return;
                        let oldFile = JSON.parse(filedata);
                        let checklist = makeCookie(data['cookie']);
                        if (oldFile[checklist] === undefined) {
                            socket.send(JSON.stringify({'new': true, 'template': config.data.defaultData}));
                            oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.data.defaultData + '}'), oldFile);
                            fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
                                if (err) return;
                                console.log("🦈 Updated 'Database'");
                            });
                        }

                        socket.send(JSON.stringify({type: "updateList", "checklist": checklist, data: JSON.parse(filedata)[makeCookie(data['cookie'])]}));
                    });
                }

                if (data['action'] === 'update') {
                    console.log(`[${debugTime()}] 🌐 POST: /api`);

                    let item = {
                        name: makeName(data.data.name),
                        checked: data.data.checked
                    }
                    console.log(item);

                    fs.readFile(config.data.data, 'utf8' , (err, Filedata) => {
                        if (err) return;
                        let addNew = true;
                        let checklist = makeCookie(data['cookie']);
                        let oldFile = JSON.parse(Filedata);

                        if (oldFile[checklist] === undefined) oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.data.defaultData + '}'), oldFile);

                        oldFile[checklist].forEach(key => {
                            if (key.name === item.name) {
                                key.checked = item.checked;
                                addNew = false;
                            }
                        });

                        if (addNew) oldFile[checklist].push(item);

                        fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
                            if (err) return;
                            console.log("🦈 Updated 'Database'");
                            sockets.forEach(s => s.send('{"type": "updateList", "checklist": "' + checklist + '", "data": ' + JSON.stringify(oldFile[checklist]) + '}'));
                        });
                    });
                }

                if (data['action'] === 'delete') {
                    console.log(`[${debugTime()}] 🌐 DELETE: /api`);
                    let checklist = makeCookie(data['cookie']);

                    let item = {
                        name: data.data.name
                    }
                    console.log(item);

                    fs.readFile(config.data.data, 'utf8' , (err, Filedata) => {
                        if (err) return;
                        let oldFile = JSON.parse(Filedata);

                        oldFile[checklist].forEach(function(key, index, object) {
                            if (key.name === item.name) {
                                object.splice(index, 1);
                            }
                        });

                        fs.writeFile(config.data.data, JSON.stringify(oldFile), function (err) {
                            if (err) return;
                            console.log("🦈 Updated 'Database'");
                            sockets.forEach(s => s.send('{"type": "updateList", "checklist": "' + checklist + '", "data": ' + JSON.stringify(oldFile[checklist]) + '}'));
                        });
                    })
                }
            });

            socket.on('close', function() {
                sockets = sockets.filter(s => s !== socket);
            });
        });
    }
}