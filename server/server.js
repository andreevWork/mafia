var express = require('express');
var path = require('path');
var ws_server = require('ws').Server;
var cookie_parser = require('cookie');
var config = require('../config');
var server = express(),
    favicon = require('serve-favicon'),
    jade = require('jade');
var PORT = 3001;

// ВНИМАНИЕ    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
// TODO если чувак не примет пулл реквест перебить на свой форк


var GameServer = require("./../logic/src/server/GameServer.js").GameServer;

var WebSocketServer = new ws_server({port: 3002, verifyClient: (info, cb) => {
    // Если путь сокета не равен ни пути для комнаты ни пути для игроков, прекращаем рукопажатие и реджектим запрос
    if(info.req.url !== config.web_socket_path.room && info.req.url !== config.web_socket_path.players) {
        cb(false, 400);
    }

    cb(true);
}});

var game_server = new GameServer(WebSocketServer);

// Делаем доступными статичные файлы: стили и скрипты
server.use(express.static('public/js'));
server.use(express.static('public/css'));
server.use(express.static('public/img'));

server.set('view engine', 'jade');
// server.set('view cache', true);
server.set('views', './views');

server.use(favicon(__dirname + '/public/favicon.ico'));



server.get('/*', noCache, function (req, res) {
    // Если запрашивается некий файл, сразу отдаем 404 код и ничего не показываем
    if(!!~req.path.indexOf('.')) {
        res.status(404).end();
        return;
    }

    let cookie;

    switch (req.path) {
        /*
         * Урл необходим как промежуточное звено, когда мы хотим создать новую комнату
         */
        case '/clear_room':
            cookie = req.headers.cookie ? cookie_parser.parse(req.headers.cookie) : {};
            
            // Удаляем куки клиента о комнате
            res.clearCookie(GameServer.getRoomToken());
            // Чистим предидущую комнату
            game_server.removeRoom(cookie[GameServer.getRoomToken()]);

            // Делаем редирект на комнату, где если нет токена в куках идет создание новой комнаты
            res.redirect(301, '/room');
            break;

        case '/':
            cookie = req.headers.cookie ? cookie_parser.parse(req.headers.cookie) : {};

            res.render('index', {
                title: 'hi',
                roles: GameServer.getRoles(),
                has_room: game_server.hasRoom(cookie[GameServer.getRoomToken()])
            });
            break;

        case '/room':
            res.render('room', {
                title: 'hi'
            });
            break;
        
        default:
            // Если есть комната с таким публичным урлом, тогда это пришел игрок
            if(game_server.hasRoom(req.path.slice(1))) {
                res.render('player', {
                    title: 'hi'
                });
            } else {
                res.render('404', {
                    title: 'hi'
                });
            }
            break;
    }
});


server.listen(PORT, function () {
    console.log('Example server listening on port ' + PORT);
});

function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}
