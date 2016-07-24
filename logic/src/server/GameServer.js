module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var cookie_parser = __webpack_require__(1);
	var Roles_1 = __webpack_require__(2);
	var RoomServer_1 = __webpack_require__(3);
	var helpers_1 = __webpack_require__(29);
	var IMessage_1 = __webpack_require__(30);
	var config = __webpack_require__(31);
	exports.ROOM_COOKIE_TOKEN = 'ROOMID';
	exports.PLAYER_COOKIE_TOKEN = 'PLAYERID';
	exports.ROOMURL_COOKIE_TOKEN = 'ROOMURL';
	var GameServer = (function () {
	    function GameServer(ws) {
	        this.ws = ws;
	        this.rooms = [];
	        this.initRooms();
	        this.initPlayers();
	    }
	    GameServer.getRoles = function () {
	        return Roles_1.RolesMapping;
	    };
	    GameServer.getRoomToken = function () {
	        return exports.ROOM_COOKIE_TOKEN;
	    };
	    GameServer.getRoomUrlToken = function () {
	        return exports.ROOMURL_COOKIE_TOKEN;
	    };
	    GameServer.prototype.hasRoom = function (token) {
	        return !!this.getRoomByToken(token) || !!this.getRoomByPublicUrl(token);
	    };
	    GameServer.prototype.removeRoom = function (token) {
	        this.rooms = this.rooms.filter(function (room) { return room.getToken() !== token; });
	    };
	    GameServer.killSocket = function (socket) {
	        socket.send(JSON.stringify('exist!!'));
	        socket.close(1000);
	    };
	    GameServer.prototype.initPlayers = function () {
	        var _this = this;
	        var players_cookie_token = {};
	        this.ws.on("headers" + config.web_socket_path.players, function (headers, upgradeReqHeaders) {
	            var cookie = upgradeReqHeaders.cookie ? cookie_parser.parse(upgradeReqHeaders.cookie) : {}, room = _this.getRoomByPublicUrl(cookie[exports.ROOMURL_COOKIE_TOKEN]);
	            if (!room)
	                return;
	            var token = helpers_1.getRandomString(32);
	            players_cookie_token[upgradeReqHeaders['sec-websocket-key']] = token;
	            headers.push("Set-Cookie: " + cookie_parser.serialize(exports.PLAYER_COOKIE_TOKEN, token, {
	                httpOnly: true
	            }));
	        });
	        this.ws.on("connection" + config.web_socket_path.players, function (socket) {
	            var cookie = socket.upgradeReq.headers.cookie ? cookie_parser.parse(socket.upgradeReq.headers.cookie) : {}, room = _this.getRoomByPublicUrl(cookie[exports.ROOMURL_COOKIE_TOKEN]), exist_player;
	            exist_player = room.getPlayerByToken(cookie[exports.PLAYER_COOKIE_TOKEN]);
	            _this.waitAuthPlayer(socket, room, players_cookie_token[socket.upgradeReq.headers['sec-websocket-key']]);
	            delete players_cookie_token[socket.upgradeReq.headers['sec-websocket-key']];
	            socket.send(JSON.stringify({ type: IMessage_1.UNAUTHORIZED }));
	        });
	    };
	    GameServer.prototype.waitAuthPlayer = function (socket, room, token) {
	        socket.once('message', AuthPlayer);
	        function AuthPlayer(message) {
	            var data = JSON.parse(message);
	            if (data.type === IMessage_1.AUTH_TYPE) {
	                room.setPlayer(data.data['name'], token);
	                room.setNewPlayerConnection(token, socket);
	            }
	            else {
	                socket.once('message', AuthPlayer);
	            }
	        }
	    };
	    GameServer.prototype.initRooms = function () {
	        var _this = this;
	        var room_cookie_token = {};
	        this.ws.on("headers" + config.web_socket_path.room, function (headers, upgradeReqHeaders) {
	            var cookie = upgradeReqHeaders.cookie ? cookie_parser.parse(upgradeReqHeaders.cookie) : {};
	            if (!_this.hasRoom(cookie[exports.ROOM_COOKIE_TOKEN])) {
	                var token = helpers_1.getRandomString(32);
	                room_cookie_token[upgradeReqHeaders['sec-websocket-key']] = token;
	                headers.push("Set-Cookie: " + cookie_parser.serialize(exports.ROOM_COOKIE_TOKEN, token, {
	                    httpOnly: true
	                }));
	            }
	        });
	        this.ws.on("connection" + config.web_socket_path.room, function (socket) {
	            var cookie = socket.upgradeReq.headers.cookie ? cookie_parser.parse(socket.upgradeReq.headers.cookie) : {}, exist_room;
	            exist_room = _this.getRoomByToken(cookie[exports.ROOM_COOKIE_TOKEN]);
	            if (exist_room) {
	                if (exist_room.hasConnection()) {
	                    GameServer.killSocket(socket);
	                    return;
	                }
	                console.log('set new connection');
	                exist_room.setNewConnection(socket);
	            }
	            else {
	                _this.rooms.push(new RoomServer_1.default(socket, room_cookie_token[socket.upgradeReq.headers['sec-websocket-key']], function () { return _this.removeEmptyRooms(); }));
	                delete room_cookie_token[socket.upgradeReq.headers['sec-websocket-key']];
	            }
	            console.log(_this.rooms.length);
	        });
	    };
	    GameServer.prototype.removeEmptyRooms = function () {
	        this.rooms = this.rooms.filter(function (room) { return !room.isEmpty(); });
	    };
	    GameServer.prototype.getRoomByToken = function (token) {
	        return token && this.rooms.find(function (room) { return room.getToken() === token; });
	    };
	    GameServer.prototype.getRoomByPublicUrl = function (public_url) {
	        return public_url && this.rooms.find(function (room) { return room.getPublicUrl() === public_url; });
	    };
	    ;
	    return GameServer;
	}());
	exports.GameServer = GameServer;


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*!
	 * cookie
	 * Copyright(c) 2012-2014 Roman Shtylman
	 * Copyright(c) 2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module exports.
	 * @public
	 */

	exports.parse = parse;
	exports.serialize = serialize;

	/**
	 * Module variables.
	 * @private
	 */

	var decode = decodeURIComponent;
	var encode = encodeURIComponent;
	var pairSplitRegExp = /; */;

	/**
	 * RegExp to match field-content in RFC 7230 sec 3.2
	 *
	 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
	 * field-vchar   = VCHAR / obs-text
	 * obs-text      = %x80-FF
	 */

	var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

	/**
	 * Parse a cookie header.
	 *
	 * Parse the given cookie header string into an object
	 * The object has the various cookies as keys(names) => values
	 *
	 * @param {string} str
	 * @param {object} [options]
	 * @return {object}
	 * @public
	 */

	function parse(str, options) {
	  if (typeof str !== 'string') {
	    throw new TypeError('argument str must be a string');
	  }

	  var obj = {}
	  var opt = options || {};
	  var pairs = str.split(pairSplitRegExp);
	  var dec = opt.decode || decode;

	  for (var i = 0; i < pairs.length; i++) {
	    var pair = pairs[i];
	    var eq_idx = pair.indexOf('=');

	    // skip things that don't look like key=value
	    if (eq_idx < 0) {
	      continue;
	    }

	    var key = pair.substr(0, eq_idx).trim()
	    var val = pair.substr(++eq_idx, pair.length).trim();

	    // quoted values
	    if ('"' == val[0]) {
	      val = val.slice(1, -1);
	    }

	    // only assign once
	    if (undefined == obj[key]) {
	      obj[key] = tryDecode(val, dec);
	    }
	  }

	  return obj;
	}

	/**
	 * Serialize data into a cookie header.
	 *
	 * Serialize the a name value pair into a cookie string suitable for
	 * http headers. An optional options object specified cookie parameters.
	 *
	 * serialize('foo', 'bar', { httpOnly: true })
	 *   => "foo=bar; httpOnly"
	 *
	 * @param {string} name
	 * @param {string} val
	 * @param {object} [options]
	 * @return {string}
	 * @public
	 */

	function serialize(name, val, options) {
	  var opt = options || {};
	  var enc = opt.encode || encode;

	  if (typeof enc !== 'function') {
	    throw new TypeError('option encode is invalid');
	  }

	  if (!fieldContentRegExp.test(name)) {
	    throw new TypeError('argument name is invalid');
	  }

	  var value = enc(val);

	  if (value && !fieldContentRegExp.test(value)) {
	    throw new TypeError('argument val is invalid');
	  }

	  var str = name + '=' + value;

	  if (null != opt.maxAge) {
	    var maxAge = opt.maxAge - 0;
	    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
	    str += '; Max-Age=' + Math.floor(maxAge);
	  }

	  if (opt.domain) {
	    if (!fieldContentRegExp.test(opt.domain)) {
	      throw new TypeError('option domain is invalid');
	    }

	    str += '; Domain=' + opt.domain;
	  }

	  if (opt.path) {
	    if (!fieldContentRegExp.test(opt.path)) {
	      throw new TypeError('option path is invalid');
	    }

	    str += '; Path=' + opt.path;
	  }

	  if (opt.expires) {
	    if (typeof opt.expires.toUTCString !== 'function') {
	      throw new TypeError('option expires is invalid');
	    }

	    str += '; Expires=' + opt.expires.toUTCString();
	  }

	  if (opt.httpOnly) {
	    str += '; HttpOnly';
	  }

	  if (opt.secure) {
	    str += '; Secure';
	  }

	  if (opt.sameSite) {
	    var sameSite = typeof opt.sameSite === 'string'
	      ? opt.sameSite.toLowerCase() : opt.sameSite;

	    switch (sameSite) {
	      case true:
	        str += '; SameSite=Strict';
	        break;
	      case 'lax':
	        str += '; SameSite=Lax';
	        break;
	      case 'strict':
	        str += '; SameSite=Strict';
	        break;
	      default:
	        throw new TypeError('option sameSite is invalid');
	    }
	  }

	  return str;
	}

	/**
	 * Try decoding a string using a decoding function.
	 *
	 * @param {string} str
	 * @param {function} decode
	 * @private
	 */

	function tryDecode(str, decode) {
	  try {
	    return decode(str);
	  } catch (e) {
	    return str;
	  }
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var Roles;
	(function (Roles) {
	    Roles[Roles["INHABITANT"] = 0] = "INHABITANT";
	    Roles[Roles["MAFIA"] = 1] = "MAFIA";
	    Roles[Roles["DOCTOR"] = 2] = "DOCTOR";
	    Roles[Roles["COMMISSAR"] = 3] = "COMMISSAR";
	    Roles[Roles["WHORE"] = 4] = "WHORE";
	})(Roles || (Roles = {}));
	exports.RolesMapping = {};
	exports.RolesMapping[Roles.INHABITANT] = {
	    title: 'Мирные жители',
	    description: 'Играют только “днем”, могут в это время суток, с помощью голосования, казнить одного из игроков. До конца игры не знают, кто из игроков за кого играет.',
	    card_img: 'inhabitant.png'
	};
	exports.RolesMapping[Roles.MAFIA] = {
	    title: 'Мафия',
	    description: 'Днем прикидываются мирными жителями, ночью просыпаются и убивают мирных жителей. Все Мафиози знают друг друга.',
	    card_img: 'mafia.png'
	};
	exports.RolesMapping[Roles.DOCTOR] = {
	    title: 'Доктор',
	    description: 'Играет за жителей. Игрок, получивший эту роль, может спасти ночью от смерти одного из игроков.',
	    card_img: 'doctor.png'
	};
	exports.RolesMapping[Roles.COMMISSAR] = {
	    title: 'Комиссар',
	    description: 'Играет за жителей. Просыпаясь ночью и выбрав одного игрока, он получает ответ на вопрос, является ли указанный человек мафиози.',
	    card_img: 'commissar.png'
	};
	exports.RolesMapping[Roles.WHORE] = {
	    title: 'Путана',
	    description: 'Играет за жителей. Ночью путана выбирает одного из игроков, которого она спасает от смерти. Отличие только в том, что если убивают доктора, то пациент остается жив. Если же представительница древнейшей профессии сама становится ночной жертвой мафии, то вместе с ней погибает и ее клиент.',
	    card_img: 'whore.png'
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Roles;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var redux_1 = __webpack_require__(4);
	var RoomReducer_1 = __webpack_require__(18);
	var RoomAction_1 = __webpack_require__(21);
	var GameReducer_1 = __webpack_require__(24);
	var _ = __webpack_require__(20);
	var helpers_1 = __webpack_require__(29);
	var Player_1 = __webpack_require__(28);
	var IMessage_1 = __webpack_require__(30);
	var GameAction_1 = __webpack_require__(25);
	var RoomStatus_1 = __webpack_require__(22);
	var GameStatus_1 = __webpack_require__(26);
	var RoomServer = (function () {
	    function RoomServer(connection, token, clear_callback) {
	        var _this = this;
	        this.clear_callback = clear_callback;
	        this.players_connections = {};
	        this.time_last_update = Date.now();
	        this.time_last_update_players = Date.now();
	        this.clear_timer_time = 1000 * 60 * 2;
	        console.log('NEW connection');
	        var public_url = helpers_1.getRandomString(5);
	        this.store = redux_1.createStore(redux_1.combineReducers({
	            room: RoomReducer_1.default,
	            game: GameReducer_1.default
	        }));
	        this.store.dispatch(RoomAction_1.default.createRoom(token, public_url));
	        this.store.subscribe(function () {
	            console.log('store update');
	            if (_this.store.getState().room.time_last_update > _this.time_last_update || _this.store.getState().game.time_last_update > _this.time_last_update) {
	                _this.sendStateToClient();
	                _this.time_last_update = Date.now();
	            }
	            if (_this.store.getState().game.time_last_update_players > _this.time_last_update_players) {
	                _this.store.getState().game.players
	                    .filter(function (player) {
	                    if (_this.store.getState().game.active_roles && _this.store.getState().game.active_roles.length) {
	                        return !!~_this.store.getState().game.active_roles.indexOf(player.role);
	                    }
	                    if (_this.store.getState().game.round_data) {
	                        if (_this.store.getState().game.round_data.killed && _this.store.getState().game.round_data.killed.length) {
	                            return !!~_this.store.getState().game.round_data.killed.indexOf(player.token);
	                        }
	                        if (_this.store.getState().game.round_data.execution) {
	                            return _this.store.getState().game.round_data.execution === player.token;
	                        }
	                    }
	                    return true;
	                })
	                    .forEach(function (player) {
	                    _this.sendPlayerStateToClient(player.token);
	                });
	                _this.time_last_update_players = Date.now();
	            }
	            if (_this.store.getState().game.votes.length && !_this.store.getState().game.votes.find(function (vote) { return !vote.for_whom_token; })) {
	                _this.store.dispatch(GameAction_1.default.nextGameStep(GameStatus_1.GameStatusHelpers.getNextStatus(_this.store.getState().game)));
	            }
	        });
	        this.setNewConnection(connection);
	    }
	    RoomServer.prototype.setPlayer = function (name, token) {
	        this.store.dispatch(RoomAction_1.default.addPlayer({ name: name, token: token }));
	    };
	    RoomServer.prototype.setNewPlayerConnection = function (token, connection) {
	        var _this = this;
	        this.players_connections[token] = connection;
	        connection.on('message', function (message) {
	            var data = JSON.parse(message);
	            switch (data.type) {
	                case IMessage_1.VOTE_TYPE:
	                    _this.store.dispatch(GameAction_1.default.vote(token, data.data['token']));
	                    break;
	            }
	        });
	        connection.on('close', function (message) {
	            _this.players_connections[token] = null;
	        });
	        this.sendPlayerStateToClient(token);
	    };
	    RoomServer.prototype.getToken = function () {
	        return this.store.getState().room.token;
	    };
	    RoomServer.prototype.hasPlayer = function (token) {
	        return !!this.store.getState().room.players.find(function (player) { return player.token === token; });
	    };
	    RoomServer.prototype.getPlayerByToken = function (token) {
	        return this.store.getState().room.players.find(function (player) { return player.token === token; });
	    };
	    RoomServer.prototype.getPublicUrl = function () {
	        return this.store.getState().room.public_url;
	    };
	    RoomServer.prototype.isEmpty = function () {
	        return (this.store === null && this.connection === null) ? true : false;
	    };
	    RoomServer.prototype.hasConnection = function () {
	        return this.connection !== null;
	    };
	    RoomServer.prototype.setNewConnection = function (connection) {
	        var _this = this;
	        if (this.clear_timer) {
	            clearTimeout(this.clear_timer);
	        }
	        this.connection = connection;
	        this.connection.on('message', function (message) {
	            var data = JSON.parse(message);
	            switch (data.type) {
	                case IMessage_1.ACTION_TYPE:
	                    if (data.data['action'] === IMessage_1.MainAction.START_GAME) {
	                        _this.store.dispatch(RoomAction_1.default.startPlay());
	                        _this.store.dispatch(GameAction_1.default.createGame(Player_1.Player.RolesForPlayers(_this.store.getState().room.players)));
	                    }
	                    if (data.data['action'] === IMessage_1.MainAction.NEXT_STEP) {
	                        _this.store.dispatch(GameAction_1.default.nextGameStep(GameStatus_1.GameStatusHelpers.getNextStatus(_this.store.getState().game)));
	                    }
	                    break;
	            }
	        });
	        this.connection.on('close', function (message) {
	            _this.connection = null;
	            _this.clear_timer = setTimeout(function () { return _this.clear(); }, _this.clear_timer_time);
	        });
	        this.sendStateToClient();
	    };
	    RoomServer.prototype.clear = function () {
	        this.store = null;
	        this.time_last_update = null;
	        this.clear_timer = null;
	        this.clear_callback();
	    };
	    RoomServer.prototype.sendStateToClient = function () {
	        this.sendDataToClient({
	            type: IMessage_1.STATE,
	            payload: this.getStateForClient()
	        });
	    };
	    RoomServer.prototype.sendPlayerStateToClient = function (token) {
	        this.sendPlayerDataToClient({
	            type: IMessage_1.PLAYER_STATE,
	            payload: this.getPlayerStateForClient(token)
	        }, token);
	    };
	    RoomServer.prototype.sendDataToClient = function (data) {
	        this.connection.send(JSON.stringify(data));
	    };
	    RoomServer.prototype.sendPlayerDataToClient = function (data, token) {
	        this.players_connections[token].send(JSON.stringify(data));
	    };
	    RoomServer.prototype.getStateForClient = function () {
	        return {
	            room: this.getStateRoomForClient(),
	            game: this.getStateGameForClient()
	        };
	    };
	    RoomServer.prototype.getPlayerStateForClient = function (token) {
	        var _this = this;
	        var is_wait = this.store.getState().room.status !== RoomStatus_1.default.PLAYING, data = { role: null, name: null };
	        if (!is_wait) {
	            var player = this.store.getState().game.players.find(function (player) { return player.token === token; });
	            data.role = player.role;
	            data.name = player.name;
	            data.vote_variants = this.store.getState().game.vote_variants.map(function (token) {
	                return {
	                    token: token,
	                    name: _this.getPlayerByToken(token).name
	                };
	            });
	            if (this.store.getState().game.status === GameStatus_1.GameStatus.VOTE_INHABITANT) {
	                data.vote_variants = data.vote_variants.filter(function (obj) { return obj.token !== token; });
	            }
	            if (this.store.getState().game.round_data &&
	                this.store.getState().game.round_data.killed &&
	                this.store.getState().game.round_data.killed.length &&
	                !!~this.store.getState().game.round_data.killed.indexOf(token)) {
	                data.is_killed = true;
	            }
	            if (this.store.getState().game.round_data &&
	                this.store.getState().game.round_data.execution &&
	                this.store.getState().game.round_data.execution == token) {
	                data.is_killed = true;
	            }
	        }
	        return {
	            is_wait: is_wait,
	            data: data
	        };
	    };
	    RoomServer.prototype.getStateGameForClient = function () {
	        var _this = this;
	        var state = _.clone(this.store.getState().game);
	        delete state.players;
	        delete state.vote_variants;
	        delete state.votes;
	        delete state.active_roles;
	        delete state.prev_round_healing;
	        delete state.time_last_update;
	        delete state.time_last_update_players;
	        if (state.round_data && (state.round_data.killed || state.round_data.execution)) {
	            state.round_data = _.clone(state.round_data);
	            if (state.round_data.killed && state.round_data.killed.length) {
	                state.round_data.killed = state.round_data.killed.map(function (token) { return _this.getPlayerByToken(token).name; });
	            }
	            if (state.round_data.execution) {
	                state.round_data.execution = this.getPlayerByToken(state.round_data.execution).name;
	            }
	        }
	        return state;
	    };
	    RoomServer.prototype.getStateRoomForClient = function () {
	        var state = _.clone(this.store.getState().room);
	        delete state.token;
	        delete state.time_last_update;
	        delete state.time_last_update_players;
	        return state;
	    };
	    return RoomServer;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RoomServer;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

	var _createStore = __webpack_require__(6);

	var _createStore2 = _interopRequireDefault(_createStore);

	var _combineReducers = __webpack_require__(13);

	var _combineReducers2 = _interopRequireDefault(_combineReducers);

	var _bindActionCreators = __webpack_require__(15);

	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

	var _applyMiddleware = __webpack_require__(16);

	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

	var _compose = __webpack_require__(17);

	var _compose2 = _interopRequireDefault(_compose);

	var _warning = __webpack_require__(14);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}

	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}

	exports.createStore = _createStore2["default"];
	exports.combineReducers = _combineReducers2["default"];
	exports.bindActionCreators = _bindActionCreators2["default"];
	exports.applyMiddleware = _applyMiddleware2["default"];
	exports.compose = _compose2["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports["default"] = createStore;

	var _isPlainObject = __webpack_require__(7);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _symbolObservable = __webpack_require__(11);

	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};

	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [initialState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, initialState, enhancer) {
	  var _ref2;

	  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = initialState;
	    initialState = undefined;
	  }

	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }

	    return enhancer(createStore)(reducer, initialState);
	  }

	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }

	  var currentReducer = reducer;
	  var currentState = initialState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;

	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }

	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }

	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }

	    var isSubscribed = true;

	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);

	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      isSubscribed = false;

	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }

	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2["default"])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }

	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }

	    return action;
	  }

	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }

	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }

	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;

	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */

	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }

	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }

	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2["default"]] = function () {
	      return this;
	    }, _ref;
	  }

	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });

	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2["default"]] = observable, _ref2;
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(8),
	    isHostObject = __webpack_require__(9),
	    isObjectLike = __webpack_require__(10);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object,
	 *  else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	module.exports = isPlainObject;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf;

	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}

	module.exports = getPrototype;


/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	module.exports = isHostObject;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global window */
	'use strict';

	module.exports = __webpack_require__(12)(global || window || this);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function symbolObservablePonyfill(root) {
		var result;
		var Symbol = root.Symbol;

		if (typeof Symbol === 'function') {
			if (Symbol.observable) {
				result = Symbol.observable;
			} else {
				result = Symbol('observable');
				Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports["default"] = combineReducers;

	var _createStore = __webpack_require__(6);

	var _isPlainObject = __webpack_require__(7);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _warning = __webpack_require__(14);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}

	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }

	  if (!(0, _isPlainObject2["default"])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }

	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key);
	  });

	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}

	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }

	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}

	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);

	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }

	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];

	    if (sanityError) {
	      throw sanityError;
	    }

	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
	      if (warningMessage) {
	        (0, _warning2["default"])(warningMessage);
	      }
	    }

	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}

	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }

	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }

	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports["default"] = applyMiddleware;

	var _compose = __webpack_require__(17);

	var _compose2 = _interopRequireDefault(_compose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return function (createStore) {
	    return function (reducer, initialState, enhancer) {
	      var store = createStore(reducer, initialState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];

	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */

	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }

	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  } else {
	    var _ret = function () {
	      var last = funcs[funcs.length - 1];
	      var rest = funcs.slice(0, -1);
	      return {
	        v: function v() {
	          return rest.reduceRight(function (composed, f) {
	            return f(composed);
	          }, last.apply(undefined, arguments));
	        }
	      };
	    }();

	    if (typeof _ret === "object") return _ret.v;
	  }
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var States_1 = __webpack_require__(19);
	var RoomAction_1 = __webpack_require__(21);
	var RoomStatus_1 = __webpack_require__(22);
	var GameEnvironment_1 = __webpack_require__(23);
	function RoomReducer(state, action) {
	    if (state === void 0) { state = States_1.InitialRoomState; }
	    switch (action.type) {
	        case RoomAction_1.default.CREATE_ROOM:
	            return States_1.getNewState(States_1.InitialRoomState, ['time_create', 'time_last_update'], {
	                status: RoomStatus_1.default.WAITING_PLAYERS,
	                token: action.token,
	                public_url: action.public_url
	            });
	        case RoomAction_1.default.ADD_PLAYER:
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                players: state.players.concat(action.payload),
	                is_ready: state.players.length + 1 >= GameEnvironment_1.MIN_PLAYERS ? true : false
	            });
	        case RoomAction_1.default.START_PLAY:
	            return States_1.getNewState(state, [], { status: RoomStatus_1.default.PLAYING });
	        default:
	            return state;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RoomReducer;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(20);
	exports.InitialGameState = {
	    time_last_update: 0,
	    time_last_update_players: 0,
	    time_create: 0,
	    status: null,
	    players: [],
	    active_roles: null,
	    round_number: 0,
	    vote_variants: [],
	    votes: [],
	    round_data: null
	};
	exports.InitialRoomState = {
	    time_last_update: 0,
	    time_last_update_players: 0,
	    time_create: 0,
	    status: null,
	    players: [],
	    is_ready: false
	};
	function getNewState(old_state, time_keys, piece_of_new_state) {
	    var time_state = {};
	    time_keys.forEach(function (time_key) { time_state[time_key] = Date.now(); });
	    return _.extend({}, old_state, time_state, piece_of_new_state);
	}
	exports.getNewState = getNewState;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";
	var RoomAction;
	(function (RoomAction) {
	    RoomAction[RoomAction["CREATE_ROOM"] = 50] = "CREATE_ROOM";
	    RoomAction[RoomAction["ADD_PLAYER"] = 51] = "ADD_PLAYER";
	    RoomAction[RoomAction["START_PLAY"] = 52] = "START_PLAY";
	})(RoomAction || (RoomAction = {}));
	var RoomAction;
	(function (RoomAction) {
	    function createRoom(token, public_url) {
	        return {
	            type: RoomAction.CREATE_ROOM,
	            token: token,
	            public_url: public_url
	        };
	    }
	    RoomAction.createRoom = createRoom;
	    function addPlayer(player) {
	        return {
	            type: RoomAction.ADD_PLAYER,
	            payload: player
	        };
	    }
	    RoomAction.addPlayer = addPlayer;
	    function startPlay() {
	        return {
	            type: RoomAction.START_PLAY
	        };
	    }
	    RoomAction.startPlay = startPlay;
	})(RoomAction || (RoomAction = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RoomAction;


/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";
	var RoomStatus;
	(function (RoomStatus) {
	    RoomStatus[RoomStatus["WAITING_PLAYERS"] = 0] = "WAITING_PLAYERS";
	    RoomStatus[RoomStatus["PLAYING"] = 1] = "PLAYING";
	})(RoomStatus || (RoomStatus = {}));
	var RoomStatus;
	(function (RoomStatus) {
	    function isWaitingPlayers(room_state) {
	        return room_state === RoomStatus.WAITING_PLAYERS;
	    }
	    RoomStatus.isWaitingPlayers = isWaitingPlayers;
	})(RoomStatus || (RoomStatus = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RoomStatus;


/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";
	exports.MIN_PLAYERS = 5;
	exports.STEP_CHANGE_ROLES = 2;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var States_1 = __webpack_require__(19);
	var GameAction_1 = __webpack_require__(25);
	var GameStatus_1 = __webpack_require__(26);
	var _ = __webpack_require__(20);
	var GameStatusReducer_1 = __webpack_require__(27);
	function GameReducer(state, action) {
	    if (state === void 0) { state = States_1.InitialGameState; }
	    switch (action.type) {
	        case GameAction_1.default.CREATE_GAME:
	            return States_1.getNewState(States_1.InitialGameState, ['time_create', 'time_last_update', 'time_last_update_players'], {
	                status: GameStatus_1.GameStatus.START_THE_GAME,
	                players: action.payload.players
	            });
	        case GameAction_1.default.NEXT_GAME_STEP:
	            return GameStatusReducer_1.default(state, action);
	        case GameAction_1.default.VOTE:
	            if (state.votes.length && !~_.pluck(state.votes, 'who_token').indexOf(action.payload.who_token)) {
	                return state;
	            }
	            return States_1.getNewState(state, [], {
	                votes: state.votes.map(function (vote) {
	                    return action.payload.who_token === vote.who_token ? _.extend({ for_whom_token: action.payload.for_whom_token }, vote) : vote;
	                })
	            });
	        default:
	            return state;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameReducer;


/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	var GameAction;
	(function (GameAction) {
	    GameAction[GameAction["CREATE_GAME"] = 0] = "CREATE_GAME";
	    GameAction[GameAction["NEXT_GAME_STEP"] = 1] = "NEXT_GAME_STEP";
	    GameAction[GameAction["VOTE"] = 2] = "VOTE";
	})(GameAction || (GameAction = {}));
	var GameAction;
	(function (GameAction) {
	    function createGame(players) {
	        return {
	            type: GameAction.CREATE_GAME,
	            payload: { players: players }
	        };
	    }
	    GameAction.createGame = createGame;
	    function nextGameStep(status) {
	        return {
	            type: GameAction.NEXT_GAME_STEP,
	            payload: { status: status }
	        };
	    }
	    GameAction.nextGameStep = nextGameStep;
	    function vote(who_token, for_whom_token) {
	        return {
	            type: GameAction.VOTE,
	            payload: { who_token: who_token, for_whom_token: for_whom_token }
	        };
	    }
	    GameAction.vote = vote;
	})(GameAction || (GameAction = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameAction;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(2);
	var _ = __webpack_require__(20);
	(function (GameStatus) {
	    GameStatus[GameStatus["START_THE_GAME"] = 0] = "START_THE_GAME";
	    GameStatus[GameStatus["DAY_AFTER_NIGHT"] = 1] = "DAY_AFTER_NIGHT";
	    GameStatus[GameStatus["DAY_BEFORE_NIGHT"] = 2] = "DAY_BEFORE_NIGHT";
	    GameStatus[GameStatus["WAKE_UP_INHABITANT"] = 3] = "WAKE_UP_INHABITANT";
	    GameStatus[GameStatus["VOTE_INHABITANT"] = 4] = "VOTE_INHABITANT";
	    GameStatus[GameStatus["FALL_ASLEEP_INHABITANT"] = 5] = "FALL_ASLEEP_INHABITANT";
	    GameStatus[GameStatus["WAKE_UP_MAFIA"] = 6] = "WAKE_UP_MAFIA";
	    GameStatus[GameStatus["VOTE_MAFIA"] = 7] = "VOTE_MAFIA";
	    GameStatus[GameStatus["FALL_ASLEEP_MAFIA"] = 8] = "FALL_ASLEEP_MAFIA";
	    GameStatus[GameStatus["WAKE_UP_DOCTOR"] = 9] = "WAKE_UP_DOCTOR";
	    GameStatus[GameStatus["VOTE_DOCTOR"] = 10] = "VOTE_DOCTOR";
	    GameStatus[GameStatus["FALL_ASLEEP_DOCTOR"] = 11] = "FALL_ASLEEP_DOCTOR";
	    GameStatus[GameStatus["WAKE_UP_WHORE"] = 12] = "WAKE_UP_WHORE";
	    GameStatus[GameStatus["VOTE_WHORE"] = 13] = "VOTE_WHORE";
	    GameStatus[GameStatus["FALL_ASLEEP_WHORE"] = 14] = "FALL_ASLEEP_WHORE";
	    GameStatus[GameStatus["WAKE_UP_COMMISSAR"] = 15] = "WAKE_UP_COMMISSAR";
	    GameStatus[GameStatus["VOTE_COMMISSAR"] = 16] = "VOTE_COMMISSAR";
	    GameStatus[GameStatus["FALL_ASLEEP_COMMISSAR"] = 17] = "FALL_ASLEEP_COMMISSAR";
	})(exports.GameStatus || (exports.GameStatus = {}));
	var GameStatus = exports.GameStatus;
	var GameStatusHelpers;
	(function (GameStatusHelpers) {
	    function getActiveRole(game_status) {
	        switch (game_status) {
	            case GameStatus.VOTE_MAFIA:
	                return [Roles_1.default.MAFIA];
	            case GameStatus.VOTE_DOCTOR:
	                return [Roles_1.default.DOCTOR];
	            case GameStatus.VOTE_WHORE:
	                return [Roles_1.default.WHORE];
	            case GameStatus.VOTE_COMMISSAR:
	                return [Roles_1.default.COMMISSAR];
	            case GameStatus.VOTE_INHABITANT:
	                return [Roles_1.default.MAFIA, Roles_1.default.DOCTOR, Roles_1.default.INHABITANT, Roles_1.default.WHORE, Roles_1.default.COMMISSAR];
	            default:
	                return null;
	        }
	    }
	    GameStatusHelpers.getActiveRole = getActiveRole;
	    function getNextStatus(state) {
	        switch (state.status) {
	            case GameStatus.START_THE_GAME:
	            case GameStatus.DAY_BEFORE_NIGHT:
	                return GameStatus.FALL_ASLEEP_INHABITANT;
	            case GameStatus.WAKE_UP_INHABITANT:
	                return GameStatus.DAY_AFTER_NIGHT;
	            case GameStatus.DAY_AFTER_NIGHT:
	                return GameStatus.VOTE_INHABITANT;
	            case GameStatus.VOTE_INHABITANT:
	                return GameStatus.DAY_BEFORE_NIGHT;
	            case GameStatus.FALL_ASLEEP_INHABITANT:
	                return GameStatus.WAKE_UP_MAFIA;
	            case GameStatus.WAKE_UP_MAFIA:
	                return GameStatus.VOTE_MAFIA;
	            case GameStatus.VOTE_MAFIA:
	                return GameStatus.FALL_ASLEEP_MAFIA;
	            case GameStatus.WAKE_UP_DOCTOR:
	                return GameStatus.VOTE_DOCTOR;
	            case GameStatus.VOTE_DOCTOR:
	                return GameStatus.FALL_ASLEEP_DOCTOR;
	            case GameStatus.WAKE_UP_WHORE:
	                return GameStatus.VOTE_WHORE;
	            case GameStatus.VOTE_WHORE:
	                return GameStatus.FALL_ASLEEP_WHORE;
	            case GameStatus.WAKE_UP_COMMISSAR:
	                return GameStatus.VOTE_COMMISSAR;
	            case GameStatus.VOTE_COMMISSAR:
	                return GameStatus.FALL_ASLEEP_COMMISSAR;
	            case GameStatus.FALL_ASLEEP_COMMISSAR:
	                return GameStatus.WAKE_UP_INHABITANT;
	            case GameStatus.FALL_ASLEEP_MAFIA:
	                if (_.findWhere(state.players, { role: Roles_1.default.DOCTOR })) {
	                    return GameStatus.WAKE_UP_DOCTOR;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.WHORE })) {
	                    return GameStatus.WAKE_UP_WHORE;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	            case GameStatus.FALL_ASLEEP_DOCTOR:
	                if (_.findWhere(state.players, { role: Roles_1.default.WHORE })) {
	                    return GameStatus.WAKE_UP_WHORE;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	            case GameStatus.FALL_ASLEEP_WHORE:
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	        }
	    }
	    GameStatusHelpers.getNextStatus = getNextStatus;
	})(GameStatusHelpers = exports.GameStatusHelpers || (exports.GameStatusHelpers = {}));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var States_1 = __webpack_require__(19);
	var GameStatus_1 = __webpack_require__(26);
	var Player_1 = __webpack_require__(28);
	var _ = __webpack_require__(20);
	var Roles_1 = __webpack_require__(2);
	var helpers_1 = __webpack_require__(29);
	function GameStatusReducer(state, action) {
	    if (state === void 0) { state = States_1.InitialGameState; }
	    var round_data = state.round_data || {};
	    var players = state.players;
	    var win_role;
	    switch (action.payload.status) {
	        case GameStatus_1.GameStatus.DAY_BEFORE_NIGHT:
	            var execution = '';
	            if (state.votes.length) {
	                execution = helpers_1.getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token'));
	            }
	            if (Player_1.Player.isEqualMafiaAndOthers(state.players, execution)) {
	                win_role = Roles_1.default.MAFIA;
	            }
	            if (!Player_1.Player.hasMafia(state.players, execution)) {
	                win_role = Roles_1.default.INHABITANT;
	            }
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                round_data: { execution: execution },
	                votes: [],
	                vote_variants: [],
	                win_role: win_role,
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.DAY_AFTER_NIGHT:
	            if (!_.isEmpty(round_data.killed)) {
	                players = players.filter(function (player) { return !~round_data.killed.indexOf(player.token); });
	            }
	            if (Player_1.Player.isEqualMafiaAndOthers(players)) {
	                win_role = Roles_1.default.MAFIA;
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                players: players,
	                win_role: win_role
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_INHABITANT:
	            if (state.round_data && state.round_data.execution) {
	                players = players.filter(function (player) { return player.token !== state.round_data.execution; });
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                round_data: null,
	                players: players,
	                round_number: ++state.round_number
	            });
	        case GameStatus_1.GameStatus.WAKE_UP_INHABITANT:
	            round_data = _.clone(state.round_data);
	            round_data.killed = [];
	            round_data.killed = round_data.killed.concat(round_data.mafia_target);
	            var whore = _.findWhere(state.players, { role: Roles_1.default.WHORE });
	            if (whore && whore.token === round_data.mafia_target && _.findWhere(state.players, { token: round_data.real_man }).role !== Roles_1.default.MAFIA) {
	                round_data.killed = round_data.killed.concat(round_data.real_man);
	            }
	            if (round_data.mafia_target === round_data.real_man) {
	                round_data.killed = [];
	            }
	            if (~round_data.killed.indexOf(round_data.healing)) {
	                round_data.killed = _.without(round_data.killed, round_data.healing);
	            }
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                round_data: round_data
	            });
	        case GameStatus_1.GameStatus.VOTE_COMMISSAR:
	        case GameStatus_1.GameStatus.VOTE_MAFIA:
	        case GameStatus_1.GameStatus.VOTE_INHABITANT:
	        case GameStatus_1.GameStatus.VOTE_DOCTOR:
	        case GameStatus_1.GameStatus.VOTE_WHORE:
	            var active_roles_1 = GameStatus_1.GameStatusHelpers.getActiveRole(action.payload.status), vote_variants = state.players
	                .filter(function (player) {
	                if (GameStatus_1.GameStatus.VOTE_DOCTOR === action.payload.status) {
	                    return state.prev_round_healing ? state.prev_round_healing !== player.token : true;
	                }
	                if (GameStatus_1.GameStatus.VOTE_INHABITANT === action.payload.status) {
	                    return true;
	                }
	                return !~active_roles_1.indexOf(player.role);
	            })
	                .map(function (player) { return player.token; }), votes = state.players
	                .filter(function (player) { return !!~active_roles_1.indexOf(player.role); })
	                .map(function (player) { return ({ who_token: player.token }); });
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                active_roles: active_roles_1,
	                vote_variants: vote_variants,
	                votes: votes
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_MAFIA:
	        case GameStatus_1.GameStatus.FALL_ASLEEP_DOCTOR:
	        case GameStatus_1.GameStatus.FALL_ASLEEP_WHORE:
	            var vote_result = helpers_1.getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token')), prev_round_healing = void 0;
	            switch (action.payload.status) {
	                case GameStatus_1.GameStatus.FALL_ASLEEP_DOCTOR:
	                    round_data.healing = prev_round_healing = vote_result;
	                    break;
	                case GameStatus_1.GameStatus.FALL_ASLEEP_MAFIA:
	                    round_data.mafia_target = vote_result;
	                    break;
	                case GameStatus_1.GameStatus.FALL_ASLEEP_WHORE:
	                    round_data.real_man = vote_result;
	                    break;
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                round_data: round_data,
	                prev_round_healing: prev_round_healing,
	                votes: [],
	                vote_variants: [],
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_COMMISSAR:
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                votes: [],
	                vote_variants: [],
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.WAKE_UP_MAFIA:
	        case GameStatus_1.GameStatus.WAKE_UP_DOCTOR:
	        case GameStatus_1.GameStatus.WAKE_UP_WHORE:
	        case GameStatus_1.GameStatus.WAKE_UP_COMMISSAR:
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status
	            });
	        default:
	            return state;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameStatusReducer;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(2);
	var _ = __webpack_require__(20);
	var GameEnvironment_1 = __webpack_require__(23);
	var Player;
	(function (Player) {
	    Player.Avatars = {
	        path: '/public/img/avatars/',
	        variants: [
	            'lady.png',
	            'black.png'
	        ]
	    };
	    function RolesForPlayers(players) {
	        var steps = Math.floor((players.length - GameEnvironment_1.MIN_PLAYERS) / GameEnvironment_1.STEP_CHANGE_ROLES) + 1, game_players = _.shuffle(players).map(function (player) { return _.extend({ role: Roles_1.default.INHABITANT }, player); }), flag_commissar = false, index = 0;
	        game_players[index++].role = Roles_1.default.DOCTOR;
	        game_players[index++].role = Roles_1.default.WHORE;
	        while (steps--) {
	            game_players[index++].role = Roles_1.default.MAFIA;
	            if (steps % 2 !== 0) {
	                if (!flag_commissar) {
	                    game_players[index++].role = Roles_1.default.COMMISSAR;
	                    flag_commissar = true;
	                }
	            }
	        }
	        return game_players;
	    }
	    Player.RolesForPlayers = RolesForPlayers;
	    function isEqualMafiaAndOthers(players, remove_in_future_token) {
	        if (players === void 0) { players = []; }
	        var mafia_count = 0, others_count = 0;
	        players.forEach(function (player) {
	            if (remove_in_future_token === player.token)
	                return;
	            if (player.role === Roles_1.default.MAFIA) {
	                mafia_count++;
	            }
	            else {
	                others_count++;
	            }
	        });
	        return players.length && mafia_count === others_count;
	    }
	    Player.isEqualMafiaAndOthers = isEqualMafiaAndOthers;
	    function hasMafia(players, remove_in_future_token) {
	        if (players === void 0) { players = []; }
	        var mafia_count = 0;
	        players.forEach(function (player) {
	            if (remove_in_future_token === player.token)
	                return;
	            if (player.role === Roles_1.default.MAFIA) {
	                mafia_count++;
	            }
	        });
	        return players.length && !!mafia_count;
	    }
	    Player.hasMafia = hasMafia;
	})(Player = exports.Player || (exports.Player = {}));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(20);
	function getMaxRepeatValue(arr) {
	    var obj = {
	        max: {
	            count: 0,
	            value: ''
	        }
	    };
	    _.shuffle(arr).forEach(function (val) {
	        obj[val] = obj[val] || 0;
	        obj[val]++;
	        if (obj[val] > obj.max.count) {
	            obj.max.count = obj[val];
	            obj.max.value = val;
	        }
	    });
	    return obj.max.value;
	}
	exports.getMaxRepeatValue = getMaxRepeatValue;
	function getRandomString(len) {
	    var str = '123456789qwertyuiopasdfghjklzxcvbnm', arr_symbols = str.split(''), random_str = '';
	    while (len--) {
	        random_str += arr_symbols[Math.floor(Math.random() * str.length)];
	    }
	    return random_str;
	}
	exports.getRandomString = getRandomString;


/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";
	(function (MainAction) {
	    MainAction[MainAction["START_GAME"] = 0] = "START_GAME";
	    MainAction[MainAction["NEXT_STEP"] = 1] = "NEXT_STEP";
	})(exports.MainAction || (exports.MainAction = {}));
	var MainAction = exports.MainAction;
	exports.UNAUTHORIZED = 'unauthorized';
	exports.STATE = 'state';
	exports.PLAYER_STATE = 'player_state';
	exports.AUTH_TYPE = 'auth_type';
	exports.ACTION_TYPE = 'action_type';
	exports.VOTE_TYPE = 'vote_type';


/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = {
	    web_socket_path : {
	        room: '/room',
	        players: '/players'
	    },
	    web_socket_port : 3002,
	    domain: 'localhost'
	};

/***/ }
/******/ ]);