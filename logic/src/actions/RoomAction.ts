import {Player} from "../entity/Player";
import {IAction} from "~redux/redux";

// Был конфликт между action-оми было решено присвоить большие значния enum
enum RoomAction {
    CREATE_ROOM = 50,
    ADD_PLAYER = 51,
    START_PLAY = 52
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