import {Player} from "../entity/Player";
import {IAction} from "~redux/redux";

enum RoomAction {
    CREATE_ROOM,
    ADD_PLAYER,
    START_PLAY
}

export interface IRoomAction extends IAction {
    payload? : Player
}

namespace RoomAction {
    export function createRoom(): IRoomAction {
        return {
            type: RoomAction.CREATE_ROOM
        }
    }

    export function addPlayer(player: Player): IRoomAction {
        return {
            type: RoomAction.ADD_PLAYER,
            payload: player
        }
    }

    export function startPlay(): IRoomAction {
        return {
            type: RoomAction.START_PLAY
        }
    }
}

export default RoomAction;