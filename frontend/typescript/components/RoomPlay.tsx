import * as React from "react";
import WebSocketService from "../services/WebSocketService";
import {StateMainClient} from "../../../logic/src/entity/States";
import PublicUrl from "./PublicUrl";
import Players from "./Players";
import RoomGameStatus from "./RoomGameStatus";
import {MainAction} from "../../../logic/src/server/IMessage";
import Roles from "../../../logic/src/entity/Roles";
import {getGameStateWithPlayersAndExecution} from "../../../logic/_test/mocks/GameStateMocks";
var config = require('../../../config');

export interface IRoomPlayProps extends StateMainClient {

}

export default class RoomPlay extends React.Component<IRoomPlayProps, void> {

    render() {
        return <div className="room-container">
            <header className="room-header">
                <span>{this.props.game.round_number === 0 ? 'Начало' : `Раунд № ${this.props.game.round_number}`}</span>
            </header>
            <div className="room-content">
                {
                    this.props.game.win_role !== void 0 ? <WinScreen role={this.props.game.win_role}/>
                        :
                    <RoomGameStatus
                        status={this.props.game.status}
                        execution={this.props.game.round_data && this.props.game.round_data.execution}
                        killed={this.props.game.round_data && this.props.game.round_data.killed}/>
                }
            </div>
        </div>
    }
}


const WinScreen = ({role}) => {
    return   <div>
        {role === Roles.MAFIA ? <span>Победила мафия</span> : <span>Победили мирные жители</span>}
    </div>;
};

