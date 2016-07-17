import {RoomState, InitialRoomState, getNewState} from "../entity/States";
import RoomAction, {IRoomAction} from "../actions/RoomAction";
import RoomStatus from "../entity/RoomStatus";
import * as _ from 'underscore';
import {MIN_PLAYERS} from "../entity/GameEnvironment";



export default function RoomReducer (state: RoomState = InitialRoomState, action: IRoomAction): RoomState {
    switch(action.type) {
        case RoomAction.CREATE_ROOM:
            return getNewState(InitialRoomState, ['time_create', 'time_last_update'], {
                status: RoomStatus.WAITING_PLAYERS,
                token: action.token,
                public_url: action.public_url
            });

        case RoomAction.ADD_PLAYER:
            return getNewState(state, ['time_last_update', 'time_last_update_players'], {
                players: state.players.concat(action.payload),
                is_ready: state.players.length + 1 >= MIN_PLAYERS ? true : false
            });

        // В этом статусе не будем апдейтить время, т. к. за ним произойдет создание иры, где все проадейтится
        case RoomAction.START_PLAY:
            return getNewState(state, [], {status: RoomStatus.PLAYING});

        default:
            return state;
    } 
}