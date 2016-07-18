import * as React from "react";
import WebSocketService from "../services/WebSocketService";
import {StateMainClient} from "../../../logic/src/entity/States";
import PublicUrl from "./PublicUrl";
import Players from "./Players";
import {MainAction} from "../../../logic/src/server/IMessage";
var config = require('../../../config');

export interface IRoomPlayProps extends StateMainClient {

}

export default class RoomPlay extends React.Component<IRoomPlayProps, void> {

    render() {
        return <div className="room-container">
            <header className="room-header">
                <span>Статус игры: {this.props.game.round_number === 0 ? 'Начало' : `Раунд № ${this.props.game.round_number}`}</span>
            </header>
            <div className="room-content">
                играем
            </div>
        </div>
    }
}

