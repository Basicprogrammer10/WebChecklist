const base = "http://127.0.0.1:8080";

let lastRequest;
let Nodes = document.getElementsByTagName("LI");
for (let i = 0; i < Nodes.length; i++) {
    let span = document.createElement("SPAN");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    Nodes[i].appendChild(span);
}

let close = document.getElementsByClassName("close");
for (let i = 0; i < close.length; i++) {
    close[i].onclick = function () {
        let div = this.parentElement;
        div.style.display = "none";
    }
}

let list = document.querySelector('ul');
list.addEventListener('click', function (ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);

setInterval(loadList, 1000)

function newElement() {
    let li = document.createElement("li");
    let inputValue = document.getElementById("myInput").value;
    let t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') return;

    document.getElementById("myUL").appendChild(li);
    addDelete(li);
    updateDatabase(inputValue, false);
    document.getElementById("myInput").value = "";
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
    let url = base + "/api/new";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(JSON.stringify({"name": name, "checked": checked}));
}

function loadList(force) {
    let request = new XMLHttpRequest();
    request.open('GET', base + '/api/getall', true);
    request.onload = function () {
        let data = JSON.parse(this.response);
        if (lastRequest === this.response && !force) return;
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
        });
    }
    request.send();
}