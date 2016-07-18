import * as React from "react";
import {Player} from "../../../logic/src/entity/Player";

export interface IPlayersProps {
    players: Array<Player>;
}

export default class Players extends React.Component<IPlayersProps, void> {
    render() {
        return <div className="room-content__players">
            <div className="room-content__players-header">Игроки в комнате:</div>
            {this.props.players.map(player => <div className="room-content__players-item">{player.name}</div>)}
        </div>
    }
}

