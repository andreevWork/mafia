import WebSocketService from "./services/WebSocketService";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import PlayerLogin from "./components/PlayerLogin";
import {StatePlayerClient} from "../../logic/src/entity/States";
import PlayerScreen from "./components/PlayerScreen";
var config = require('../../config');

// Сразу создаем инстанс сокета, чтобы везде его могли подключать и юзать
WebSocketService.createInstance({path: config.web_socket_path.players});

let web_socket_service = WebSocketService.getInstance();

web_socket_service.onUnauthorized(() => {
    ReactDOM.render(React.createElement(PlayerLogin), document.body);
});

web_socket_service.onNewPlayerState((new_state: StatePlayerClient) => {
    ReactDOM.render(React.createElement(PlayerScreen, new_state), document.body);
});