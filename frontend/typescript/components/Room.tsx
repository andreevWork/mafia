import * as React from "react";
import WebSocketService from "../services/WebSocketService";
import {StateMainClient} from "../../../logic/src/entity/States";
import PublicUrl from "./PublicUrl";
import Players from "./Players";

export interface IRoomProps extends StateMainClient {

}

export default class Room extends React.Component<IRoomProps, void> {
    render() {
        return <div>
            <header className="room-header" />
            <div className="room-content">
                <PublicUrl public_url={this.props.room.public_url} />
                <Players players={this.props.room.players} />
            </div>
        </div>
    }
}

