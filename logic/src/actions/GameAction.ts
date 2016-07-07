import {GamePlayer} from "../entity/Player";
import {GameStatus} from "../entity/GameStatus";
import {IAction} from "~redux/redux";
import {VoteObject} from "../entity/Vote";

enum GameAction {
    CREATE_GAME,
    NEXT_GAME_STEP,
    VOTE
}

export interface IGameAction extends IAction {
    payload?: {
        players?: Array<GamePlayer>;
        
        status?: GameStatus;

        who_token?: string;
        for_whom_token?: string;
    }
}

namespace GameAction {
    export function createGame(players: Array<GamePlayer>): IGameAction {
        return {
            type: GameAction.CREATE_GAME,
            payload: {players}
        }
    }

    export function nextGameStep(status: GameStatus): IGameAction {
        return {
            type: GameAction.NEXT_GAME_STEP,
            payload: {status}
        }
    }

    export function vote(who_token: string, for_whom_token: string): IGameAction {
        return {
            type: GameAction.VOTE,
            payload: {who_token, for_whom_token}
        }
    }
}

export default GameAction;