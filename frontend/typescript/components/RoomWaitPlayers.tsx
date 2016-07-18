import * as React from "react";
import WebSocketService from "../services/WebSocketService";
import {StateMainClient} from "../../../logic/src/entity/States";
import PublicUrl from "./PublicUrl";
import Players from "./Players";
import {MainAction} from "../../../logic/src/server/IMessage";
var config = require('../../../config');

export interface IRoomProps extends StateMainClient {

}

export default class RoomWaitPlayers extends React.Component<IRoomProps, void> {

    StartGame() {
        let web_socket_service = WebSocketService.getInstance();

        web_socket_service.sendActionMessage({
            action:  MainAction.START_GAME
        });
    }
    
    render() {
        return <div className="room-container">
            <header className="room-header" />
            <div className="room-content">
                <PublicUrl public_url={config.domain + '/' + this.props.room.public_url} />
                <Players players={this.props.room.players} />
                {this.props.room.is_ready ? <div className="room-content__button-block">
                        <span className="btn" onClick={() => this.StartGame()}>Начать игру</span>
                    </div>
                    : null}
            </div>
        </div>
    }
}

