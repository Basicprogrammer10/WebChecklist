const {makeCookie, debugTime, makeName} = require("./common");
const fs = require('fs');

module.exports = function(app, config) {
    app.get('/api', function (req, res) {
        console.log(`[${debugTime()}] 🌐 GET: /api ${req.ip}`);
        console.log(makeCookie(req.cookies.checklist));

        if (makeCookie(req.cookies.checklist) === undefined) {
            res.send({'logout': true});
            return;
        }

        fs.readFile(config.data, 'utf8' , (err, data) => {
            if (err) return;
            let oldFile = JSON.parse(data);
            let checklist = makeCookie(req.cookies.checklist);
            if (oldFile[checklist] === undefined) {
                res.send({'new': true, 'template': config.defaultData});
                oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.defaultData + '}'), oldFile);
                fs.writeFile(config.data, JSON.stringify(oldFile), function (err) {
                    if (err) return;
                    console.log("🦈 Updated 'Database'");
                });
            }

            res.send(JSON.parse(data)[makeCookie(req.cookies.checklist)]);
        });
    });

    app.post('/api', function (req, res) {
        console.log(`[${debugTime()}] 🌐 POST: /api ${req.ip}`);

        let item = {
            name: makeName(req.body.name),
            checked: req.body.checked
        }
        console.log(item);

        fs.readFile(config.data, 'utf8' , (err, data) => {
            if (err) return;
            let addNew = true;
            let checklist = makeCookie(req.cookies.checklist);
            let oldFile = JSON.parse(data);

            if (oldFile[checklist] === undefined) oldFile = Object.assign(JSON.parse('{"' + checklist + '": ' + config.defaultData + '}'), oldFile);

            oldFile[checklist].forEach(key => {
                if (key.name === item.name) {
                    key.checked = item.checked;
                    addNew = false;
                }
            });

            if (addNew) oldFile[checklist].push(item);

            fs.writeFile(config.data, JSON.stringify(oldFile), function (err) {
                if (err) return;
                console.log("🦈 Updated 'Database'");
            });
        })
        res.send();
    });

    app.post('/login', function (req, res) {
        console.log(`[${debugTime()}] 🌐 POST: /login ${req.ip}`);
        console.log(req.body);

        res.cookie('checklist', req.body.checklist.toLowerCase());
        res.redirect('/');
    });

    app.delete('/api', function (req, res) {
        console.log(`[${debugTime()}] 🌐 DELETE: /api ${req.ip}`);
        let checklist = makeCookie(req.cookies.checklist);

        let item = {
            name: req.body.name
        }
        console.log(item);

        fs.readFile(config.data, 'utf8' , (err, data) => {
            if (err) return;
            let oldFile = JSON.parse(data);

            oldFile[checklist].forEach(function(key, index, object) {
                if (key.name === item.name) {
                    object.splice(index, 1);
                }
            });

            fs.writeFile(config.data, JSON.stringify(oldFile), function (err) {
                if (err) return;
                console.log("🦈 Updated 'Database'");
            });
        })
        res.send();
    });
}