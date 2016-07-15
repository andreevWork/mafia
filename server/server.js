var express = require('express');
var path = require('path');
var ws_server = require('ws').Server;
var server = express(),
    favicon = require('serve-favicon'),
    jade = require('jade');
var PORT = 3001;
var WebSocketServer = require("./../logic/src/websocket/WebSocketServer.js").WebSocketServer;

// var ws = new WebSocketServer(3002, ws_server);

// Делаем доступными статичные файлы: стили и скрипты
server.use(express.static('public/js'));
server.use(express.static('public/css'));
server.use(express.static('public/img'));

server.set('view engine', 'jade');
// server.set('view cache', true);
server.set('views', './views');

// server.use(favicon(__dirname + '/public/favicon.ico'));


server.get('/*', function (req, res, next) {
    // Если запрашивается некий файл, сразу отдаем 404 код и ничего не показываем
    if(!!~req.path.indexOf('.')) {
        res.status(404).end();
        return;
    }

    switch (req.path) {
        case '/':
            res.render('index', {
                title: 'hi'
            });
            break;

        case '/room':
            res.render('room', {
                title: 'hi'
            });
            break;

        case '/player':
            res.render('player', {
                title: 'hi'
            });
            break;
        
        default:
            res.render('404', {
                title: 'hi'
            });
            break;
    }
});


server.listen(PORT, function () {
    console.log('Example server listening on port ' + PORT);
});
