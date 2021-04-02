const base = "";

let socket = null;
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

window.onload = function() {
    createWebSocket();
}

function createWebSocket() {
    socket = new WebSocket("ws://" + window.location.href.split('/')[2]);

    socket.onopen = function (e) {
        loadList();
        setBackgroundBlur(false);
    };

    socket.onmessage = function (event) {
        setBackgroundBlur(false);
        let data = JSON.parse(event.data);
        if (data['logout']) logOut();
        if (data['doReload']) loadList();
        if (data['type'] === 'updateList') {
            if (data['checklist'] !== getCookie('checklist')) return;
            updateListFromLoad(data.data);
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) return;
        setBackgroundBlur(true)
        setTimeout(createWebSocket, 5000);
    }

    socket.onerror = function (error) {
        setBackgroundBlur(true);
        setTimeout(createWebSocket, 5000);
    };
}