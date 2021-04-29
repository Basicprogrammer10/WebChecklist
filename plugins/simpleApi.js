// Simple API Plugin
// An Easy way to interact with the Checklist
// Great for use with Simple Scripts (EX: https://gist.github.com/Basicprogrammer10/20e681099a7f4cb6d89b8dfe13300264)

const common = require("../src/common");
const fs = require("fs");

// Config For this Plugin
const localConfig = {
    allowChanging: false,
    allowDeleting: false
}

module.exports = {
    loadThis: true,
    name: "Simple API",
    version: "2.00",
    disableDefaultApi: false,

    api: [
        function (app, wsServer, config) {
            // Get all Checklist Names
            app.get("/simple", function (req, res) {
                common.log("➕ SimpleAPI", "GET /simple", req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));
                res.send(Object.keys(data));
            });

            // Get data for a checklist
            app.get("/simple/:list", function (req, res) {
                common.log("➕ SimpleAPI", `GET /simple/${req.params.list}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));
                let realId = req.params.list.toLowerCase();
                if (!(realId in data)) {
                    res.status(404).send({error: "Unknown List"});
                    return;
                }
                res.send(data[realId]);
            });

            // Stop plugin loading if changing the database is disabled
            if (!localConfig.allowChanging) return;

            // Update data for a checklist
            app.get("/simple/update/:list/:item/:checked", function (req, res) {
                let addNew = true;
                let params = {
                    list: req.params.list.toLowerCase(),
                    item: req.params.item.toLowerCase(),
                    checked: req.params.checked.toLowerCase() === 'true'
                };
                common.log("➕ SimpleAPI", `GET /simple/update/${params.list}/${params.item}/${params.checked}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));

                if (!(params.list in data)) {
                    res.status(404).send({error: "Unknown List"});
                    return;
                }

                data[params.list].forEach(key => {
                    if (key.name === params.item) {
                        key.checked = params.checked;
                        addNew = false;
                    }
                });
                if (addNew) data[params.list].push({name: params.item, checked: params.checked})
                fs.writeFileSync(config.data.data, JSON.stringify(data), "utf-8");
                res.send({success: true});
            });

            // Stop Plugin Loading if Deleting Items is disabled
            if (!config.allowDeleting) return;

            // Remove Checklist Item
            app.get("/simple/delete/:list/:item", function (req, res) {
                let params = {
                    list: req.params.list.toLowerCase(),
                    item: req.params.item
                };
                common.log("➕ SimpleAPI", `GET /simple/delete/${params.list}/${params.item}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));

                if (!(params.list in data)) {
                    res.status(404).send({error: "Unknown List"});
                    return;
                }
                let arr = []
                data[params.list].forEach(item => arr.push(item.name));
                if (!arr.includes(params.item)) {
                    res.status(404).send({error: "Unknown Item"});
                    return;
                }

                data[params.list].forEach(function (key, index, object) {
                    if (key.name === params.item) {
                        object.splice(index, 1);
                    }
                });

                fs.writeFileSync(config.data.data, JSON.stringify(data), "utf-8");
                res.send({success: true});
            });
        },
    ],
};