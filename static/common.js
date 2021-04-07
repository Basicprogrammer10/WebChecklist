function logOut() {
    delete_cookie('checklist', '/', window.location.hostname);
    window.location.href = "/login";
}

function setBackgroundBlur(value) {
    if (value) {
        document.getElementById("connection").style.display = "table";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("myUL").style.filter = "blur(8px)";
        document.getElementById("footer").style.filter = "blur(8px)";
        document.getElementById("myDIV").style.filter = "blur(8px)";
        document.getElementById("connection").style.opacity = "100%";
        document.body.style.pointerEvents = "none";
        document.body.style.position = "fixed";
        document.body.style.top = `-${window.scrollY}px`;

        return;
    }
    document.getElementById("connection").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("myUL").style.filter = "";
    document.getElementById("footer").style.filter = "";
    document.getElementById("myDIV").style.filter = "";
    document.getElementById("connection").style.opacity = "0";
    document.body.style.pointerEvents = "auto";
    document.body.style.position = "";
    document.body.style.top = '';
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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function updateDone() {
    let nums = document.getElementById("myUL");
    let listItem = nums.getElementsByTagName("li");
    let total = listItem.length;
    let done = 0;

    for (let i=0; i < listItem.length; i++) {
        if (listItem[i].classList.contains('checked')) done++;
        if (listItem[i].style.display === 'none') total--;
    }
    document.getElementById('amount').innerText = `${pad(Math.round(done/total*100), 3)}%`;
}

function updateName() {
    document.cookie.split(';').forEach(function(key) {
        let keyName = key.split('=');
        if (keyName[0] === 'checklist') {
            document.getElementById('title').innerHTML = decodeURI(keyName[1].charAt(0).toUpperCase() + keyName[1].slice(1));
            document.title = decodeURI(`WebChecklist — ${keyName[1].charAt(0).toUpperCase() + keyName[1].slice(1)}`);
        }
    });
}

function addOnClick() {
    let close = document.getElementsByClassName("close");
    for (let i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let div = this.parentElement;
            div.style.display = "none";
            deleteItem(div.innerHTML.split('<span')[0]);
            updateDone();
        }
    }
}

function newElement() {
    let li = document.createElement("li");
    let inputValue = document.getElementById("myInput").value;
    inputValue = inputValue.replace(/ $/,'')
    let t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '' ) return;

    document.getElementById("myUL").appendChild(li);
    addDelete(li);
    updateDatabase(inputValue, false);
    updateDone();
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
        socket.send(JSON.stringify({"action": "update", "cookie": getCookie('checklist'), "data": {"name": name, "checked": checked}}));
}

function deleteItem(name) {
    socket.send(JSON.stringify({"action": "delete", "cookie": getCookie('checklist'), "data": {"name": name}}));
}

function loadList() {
    let cookieInfo = getCookie('checklist');
    socket.send('{"action": "get", "cookie": "' + cookieInfo + '"}');
}

function updateListFromLoad(data) {
    if (data.logout) window.location.href = "/login";
    if (data.new) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(JSON.parse(data.template)[0].name));
        document.getElementById("myUL").appendChild(li);
        addDelete(li);
        loadList();
        return;
    }
    document.getElementById("myUL").innerHTML = '';
    data.forEach(element => {
        let li = document.createElement("li");
        let t = document.createTextNode(element.name);
        li.appendChild(t);

        document.getElementById("myUL").appendChild(li);

        if (element.checked)
            li.classList.add("checked");

        addDelete(li);
        updateName();
        updateDone();
        addOnClick();
    });
}