module.exports = {
    makeName: function (name) { return name.split('×')[0]; },
    debugTime: function () { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); },
    makeCookie: function (name) {
        if (name === undefined) return undefined;
        let working = decodeURI(name);
        let lastChar = working[working.length-1];
        if (lastChar === ' ' || lastChar === '%20') working = working.slice(0, -1);
        return working;
    }
}