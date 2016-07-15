var socket = new WebSocket("ws://localhost:3002");

socket.onmessage = function(event) {
    let data = JSON.parse(event.data);

    setCookie('room_token', data.token, {expires : 100000000000});

    document.getElementById('c').textContent = event.data;
};

// setTimeout(() => socket.send('Hi'), 2000)

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}