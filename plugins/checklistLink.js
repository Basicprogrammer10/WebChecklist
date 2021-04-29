// Plugin to allow making urls to checklists - By Connor Slade 4/28/2021
// For example if you have a checklist named 'test' you could not get there by going to '.../list/test'

const common = require("../src/common");
const fs = require("fs");

module.exports = {
    loadThis: true,
    name: "Checklist Link",
    version: "1.01",
    disableDefaultApi: false,

    api: [
        function (app, wsServer, config) {
            app.get("/list/:checklist", function (req, res) {
                let realList = req.params.checklist.toLowerCase();
                common.log("🔗 ChecklistLink", `GET /list${realList}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));
                if (!(realList in data)) {
                    let working = `<head><title>ChecklistNot Found</title>
                                   <style>body{font-family: sans-serif}</style></head>
                                   <h1>The checklist '${realList}' was not found :/</h1>
                                   <a href="/login"><button>Home</button></a>`;
                    res.set("Content-Type", "text/html");
                    res.send(Buffer.from(working));
                    return;
                }
                res.cookie("checklist", common.makeCookie(realList));
                res.redirect("/");
            });
        },
    ],
};
