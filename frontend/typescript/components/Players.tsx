import * as React from "react";
import {Player} from "../../../logic/src/entity/Player";

export interface IPlayersProps {
    players: Array<Player>;
    title: string;
    onClick?: (...args: Array<any>) => void;
}

export default class Players extends React.Component<IPlayersProps, void> {
    render() {
        return <div className="players">
            <div className="players-header">{this.props.title}</div>
            {this.props.players.map(player => <div onClick={this.props.onClick ? () => this.props.onClick(player.token) : null } className="players-item">{player.name}</div>)}
        </div>
    }
}

