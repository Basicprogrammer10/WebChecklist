# 💽 AutoBackup Plugin
This plugin will automatically backup the saved database.

It requires a server with the plugin installed and another machine to receive the backups.

## 🐛 Install

Run the server/index.js file to start the backup server. (Config changeable in file)

Then install the plugin on your WebChecklist Server and sent the config values in the .js file to point to your backup server.

## 📖 Read Backup (.wcb) files

Use the supplied deCompress.js program.

Ex: `node deCompress.js in.wcb out.json`
