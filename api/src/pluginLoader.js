const common = require("./common");
const fs = require("fs");

function load(folder) {
    let plugins = {};
    common.log('🔌 Loading Plugins');
    const commandFiles = fs.readdirSync(folder)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../${folder}/${file}`);
        if (!command.loadThis) continue;
        common.log(`🍞 Loading ${file} v${command.version}`);
        plugins[file] = {name: command.name, disable: command.disableDefaultApi, init: command.onInit, api: command.api};
    }
    runInits(plugins);
    return plugins;
}

function runInits(plugins) {
    common.log('👆 Initializing Plugins');
    for (const key in plugins) {
        if ('init' in plugins[key]) plugins[key].init();
    }
}

module.exports = {
    load
}