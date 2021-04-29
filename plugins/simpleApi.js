const common = require("../src/common");
const fs = require("fs");

module.exports = {
    loadThis: true,
    name: "Simple API",
    version: "1.00",
    disableDefaultApi: false,

    api: [
        function (app, wsServer, config) {
            app.get("/simple", function (req, res) {
                common.log("➕ SimpleAPI", "GET /simple", req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));
                res.send(Object.keys(data));
            });

            app.get("/simple/:list", function (req, res) {
                common.log("➕ SimpleAPI", `GET /simple/${req.params.list}`, req.ip);
                let data = JSON.parse(fs.readFileSync(config.data.data, "utf8"));
                let realId = req.params.list.toLowerCase();
                if (!(realId in data)) {
                    res.status(404).send({ error: "Unknown List" });
                    return;
                }
                res.send(data[realId]);
            });
        },
    ],
};