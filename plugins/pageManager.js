// Page Manager - A simple Admin Panel for the world best Web Checklist
// Goto /manage to see the (ugly) Interface
// Edit the config below to disable deleting checklists if you want

const common = require('../src/common');
const fs = require('fs');

const configLocal = {
    enabled: true, // Enable Plugin
    allowRemove: true // Show the delete button
};

function getTableForPages(dataFile, config) {
    let data = fs.readFileSync(dataFile, 'utf8');
    let working = '<title>Page Manager</title><style>table,th,td {border: 1px solid black;text-align: center;}';
    working += `body{font-family: Arial,sans-serif}</style><h1>Welcome to Page Manager v${module.exports.version}</h1>`;
    working += `<h2>Server Running WebChecklist v${config.version}</h2><table><tr><th>PageName</th><th>View</th>`;
    if (configLocal.allowRemove) working += '<th>Remove</th>';
    working += '<th>Details</th></tr>';
    Object.keys(JSON.parse(data)).sort().forEach((key, index) => {
        working += `<tr><td>${key}</td>`;
        working += `<td><a href="/manage/action/open/${key}">✅</a>`;
        if (configLocal.allowRemove) working += `</td><th><a href="/manage/action/remove/${key}/0">🗑️</a></th>`;
        working += `<td><a href="/manage/action/details/${key}">📝</a></tr>\n`;

    });
    working += '</table>';
    return working;
}

function checkedFilter(item) {
    return item.checked;
}

module.exports = {
    loadThis: configLocal.enabled,
    name: 'Page Manager',
    version: '2.03',
    disableDefaultApi: false,

    api: [
        function (app, wsServer, config) {
            app.get('/manage', function (req, res) {
                common.log("🎫 ManagePlugin", "GET /manage", req.ip);
                let table = getTableForPages(config.data.data, config);
                res.set('Content-Type', 'text/html');
                res.send(Buffer.from(table));
            });

            app.get('/manage/action/open/:id', function (req, res) {
                common.log("🎫 ManagePlugin", `GET /manage/action/open/${req.params.id}`, req.ip);
                res.cookie('checklist', common.makeCookie(req.params.id.toLowerCase()));
                res.redirect('/');
            });

            app.get('/manage/action/remove/:id/:sure', function (req, res) {
                common.log("🎫 ManagePlugin", `GET /manage/action/remove/${req.params.id}/${req.params.sure}`, req.ip);
                if (!configLocal.allowRemove) {
                    res.send('<title>Page Manager — Nice Try</title>Nice Try :P');
                    return;
                }
                if (req.params.sure !== '1') {
                    res.send(`<title>Page Manager — Ya Sure?</title><style>body{font-family: Arial,sans-serif}
                              </style><h1>Ya Sure?</h1>
                              <a href="/manage/action/remove/${req.params.id}/1"><button>Ya</button></a>
                              <a href="/manage"><button>No</button></a>`);
                    return;
                }
                let data = JSON.parse(fs.readFileSync(config.data.data, 'utf8'));
                delete data[req.params.id.toLowerCase()];
                fs.writeFileSync(config.data.data, JSON.stringify(data), 'utf-8');
                res.redirect('/manage');
            });

            app.get('/manage/action/details/:id', function (req, res) {
                common.log("🎫 ManagePlugin", `GET /manage/action/details/${req.params.id}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, 'utf8'));
                let realId = req.params.id.toLowerCase();
                if (!(realId in data)) {
                    res.send('Hmmm Cant find that document... :/<br /><a href="/manage">Home!</a>');
                    return;
                }
                let localData = data[realId];
                let percentComplete = Math.trunc(localData.filter(checkedFilter).length / localData.length * 100);
                let working = `<title>Page Manager — Info</title>
                               <style>table, th, td {border: 1px solid black;text-align: center;}
                               body{font-family: Arial,sans-serif}</style>
                               <h1>Info For <a href="/manage/action/open/${realId}">${realId}</a></h1>
                               <table><tr><th>Item</th><th>Value</th></tr>`
                working += `<tr><td>Items</td><td>${localData.length}</da></td></tr>`;
                working += `<tr><td>Checked Items</td><td>${localData.filter(checkedFilter).length}</da></td></tr>`;
                working += `<tr><td>Percent Complete</td><td>${percentComplete}%</da></td></tr>`;

                working += '</table><a href="/manage"><button>Back</button></a>';
                res.send(working);
            });
        }
    ]
}
