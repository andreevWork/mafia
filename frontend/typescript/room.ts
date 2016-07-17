import WebSocketService from "./services/WebSocketService";
import Room from "./components/Room";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {StateMainClient} from "../../logic/src/entity/States";


let web_socket_service = WebSocketService.Instance;

web_socket_service.onNewState((new_state: StateMainClient) => {
    ReactDOM.render(React.createElement(Room, new_state), document.body);
});