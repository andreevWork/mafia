import * as React from "react";
import {Player} from "../../../logic/src/entity/Player";

export interface IPlayersProps {
    players: Array<Player>;
}

export default class Players extends React.Component<IPlayersProps, void> {
    render() {
        return <div className="room-content__players">
            {this.props.players.map(player => player.name)}
        </div>
    }
}

