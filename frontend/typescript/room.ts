import WebSocketService from "./services/WebSocketService";
import RoomWaitPlayers from "./components/RoomWaitPlayers";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {StateMainClient} from "../../logic/src/entity/States";
import RoomStatus from "../../logic/src/entity/RoomStatus";
import RoomPlay from "./components/RoomPlay";
var config = require('../../config');

// Сразу создаем инстанс сокета, чтобы везде его могли подключать и юзать
WebSocketService.createInstance({path: config.web_socket_path.room});

let web_socket_service = WebSocketService.getInstance();

web_socket_service.onNewState((new_state: StateMainClient) => {
    console.log(new_state);
    
    let container = document.body;
    
    if(new_state.room.status === RoomStatus.PLAYING) {
        ReactDOM.render(React.createElement(RoomPlay, new_state), container);
    } else {
        ReactDOM.render(React.createElement(RoomWaitPlayers, new_state), container);
    }
});