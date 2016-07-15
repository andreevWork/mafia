import {Player} from "../entity/Player";
import {IAction} from "~redux/redux";

enum RoomAction {
    CREATE_ROOM,
    ADD_PLAYER,
    START_PLAY
}

export interface IRoomAction extends IAction {
    payload? : Player,
    token?: string,
    public_url?: string;
}

namespace RoomAction {
    export function createRoom(token?: string, public_url?: string): IRoomAction {
        return {
            type: RoomAction.CREATE_ROOM,
            token,
            public_url
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