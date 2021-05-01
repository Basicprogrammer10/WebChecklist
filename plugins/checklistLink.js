// Plugin to allow making urls to checklists - By Connor Slade 4/28/2021
// For example if you have a checklist named 'test' you could not get there by going to '.../list/test'

const common = require('../src/common');
const fs = require('fs');

function sendHtml(res, html) {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(html));
}

module.exports = {
    loadThis: true,
    name: 'Checklist Link',
    version: '1.10',
    disableDefaultApi: false,

    api: [
        function (app, wsServer, config) {
            app.get('/list/:checklist', function (req, res) {
                let realList = req.params.checklist.toLowerCase();
                common.log("🔗 ChecklistLink", `GET /list/${realList}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, 'utf8'));
                if (!(realList in data)) {
                    let working = `<head><title>ChecklistNot Found</title>
                                   <style>body{font-family: sans-serif}</style></head>
                                   <h1>The checklist '${realList}' was not found :/</h1>
                                   <a href="/login"><button>Home</button></a>`;
                    sendHtml(res, working);
                    return;
                }
                res.cookie('checklist', common.makeCookie(realList));
                let working = `<!DOCTYPE html><html><head>
                               <meta http-equiv="refresh" content="0; URL=/" />
                               <meta property="og:image" content="/img/EmojiCheckList.png" />
                               <meta property="og:title" content="WebChecklist" />
                               <meta property="og:type" content="website" />
                               <meta property="og:url" content="${"https://" + req.headers.host + req.url}" />
                               <meta property="og:description" content="Checklist — ${realList}" />
                               <meta name="theme-color" content="#17171a"></head><body>
                               <p>Click <a href="/">here</a> to be redirected to '${realList}'</p>
                               <script>window.location = "${"https://" + req.headers.host}";</script>
                               </body></html>`;
                sendHtml(res, working);
            });
        }
    ]
}