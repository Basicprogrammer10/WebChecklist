module.exports = {
    makeName: function (name) { return name.split('×')[0]; },
    debugTime: function () { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); },
    makeCookie: function (name) {
        if (name === undefined) return undefined;
        let working = name;
        if (working[working.length-1] === ' ') working = working.slice(0, -1);
        return working;
    }
}