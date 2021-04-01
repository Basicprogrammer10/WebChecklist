const base = "";

let lastRequest;
let close = document.getElementsByClassName("close");
let Nodes = document.getElementsByTagName("LI");
for (let i = 0; i < Nodes.length; i++) {
    let span = document.createElement("SPAN");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    Nodes[i].appendChild(span);
}

let list = document.querySelector('ul');
list.addEventListener('click', function (ev) {
    if (ev.target.tagName === 'LI') {
        let checked = false;
        if (ev.target.classList.contains('checked')) checked = true;
        ev.target.classList.toggle('checked');
        updateDatabase(ev.target.innerText.replace("×", '').replace("\n", ''), !checked);
        updateDone();
    }
}, false);

loadList();
setInterval(loadList, 5000)