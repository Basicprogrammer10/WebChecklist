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
    }
}, false);

loadList();
setInterval(loadList, 5000)

function logOut() {
    delete_cookie('checklist', '/', window.location.hostname);
    window.location.href = "/login";

}

function delete_cookie( name, path, domain ) {
    if( get_cookie( name ) ) {
        document.cookie = name + "=" +
            ((path) ? ";path="+path:"")+
            ((domain)?";domain="+domain:"") +
            ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
}

function get_cookie(name){
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}

function updateName() {
    document.cookie.split(';').forEach(function(key, index, obj) {
        let keyname = key.split('=');
        if (keyname[0] === 'checklist') {
            document.getElementById('title').innerHTML = decodeURI(keyname[1].charAt(0).toUpperCase() + keyname[1].slice(1));
            document.title = decodeURI(`WebChecklist — ${keyname[1].charAt(0).toUpperCase() + keyname[1].slice(1)}`);
        }
    });
}

function submitOnEnter(event) {
    if (event.keyCode === 13) {
        newElement();
    }
}

function addOnClick() {
    close = document.getElementsByClassName("close");
    for (let i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let div = this.parentElement;
            div.style.display = "none";
            deleteItem(div.innerHTML.split('<span')[0]);
        }
    }
}

function newElement() {
    let li = document.createElement("li");
    let inputValue = document.getElementById("myInput").value;
    let t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '' ) return;

    document.getElementById("myUL").appendChild(li);
    addDelete(li);
    updateDatabase(inputValue, false);
    document.getElementById("myInput").value = "";
    window.scrollTo(0,document.body.scrollHeight);
}

function addDelete(li) {
    let span = document.createElement("SPAN");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    for (let i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let div = this.parentElement;
            div.style.display = "none";
        }
    }
}

function updateDatabase(name, checked) {
    let url = base + "/api";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(JSON.stringify({"name": name, "checked": checked}));
}

function deleteItem(name) {
    let url = base + "/api";
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, true);

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(JSON.stringify({"name": name}));
}

function loadList() {
    let request = new XMLHttpRequest();
    request.open('GET', base + '/api', true);
    request.onload  = function () {
        let data = JSON.parse(this.response);
        if (data.logout) window.location.href = "/login";
        if (data.new) {
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(JSON.parse(data.template)[0].name));
            document.getElementById("myUL").appendChild(li);
            addDelete(li);
            return;
        }
        if (lastRequest === this.response && !document.hidden) return;
        document.getElementById("myUL").innerHTML = '';
        lastRequest = this.response;
        data.forEach(element => {
            let li = document.createElement("li");
            let t = document.createTextNode(element.name);
            li.appendChild(t);

            document.getElementById("myUL").appendChild(li);

            if (element.checked)
                li.classList.add("checked");

            addDelete(li);
            updateName();
        });
        addOnClick();
    }
    request.send();
}