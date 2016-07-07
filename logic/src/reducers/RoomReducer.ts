import {RoomState} from "../entity/States";
import RoomAction, {IRoomAction} from "../actions/RoomAction";
import RoomStatus from "../entity/RoomStatus";
import * as _ from 'underscore';

export const InitialRoomState: RoomState<RoomStatus> = {
    time_last_update: 0,
    time_create: 0,
    status: null,
    players: []
};

export default function RoomReducer (state: RoomState<RoomStatus> = InitialRoomState, action: IRoomAction): RoomState<RoomStatus> {
    switch(action.type) {
        case RoomAction.CREATE_ROOM:
            return _.extend({}, state, {
                time_create: Date.now(),
                time_last_update: Date.now(),
                status: RoomStatus.WAITING_PLAYERS
            });

        case RoomAction.ADD_PLAYER:
            return _.extend({}, state, {
                players: state.players.concat(action.payload),
                time_last_update: Date.now()
            });

        case RoomAction.START_PLAY:
            return _.extend({}, state, {
                status: RoomStatus.PLAYING,
                time_last_update: Date.now()
            });

        default:
            return state;
    } 
}