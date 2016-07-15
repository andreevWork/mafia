import {GameState, InitialGameState, getNewState} from "../entity/States";
import GameAction, {IGameAction} from "../actions/GameAction";
import {GameStatus, GameStatusHelpers} from "../entity/GameStatus";
import {GamePlayer} from "../entity/Player";
import {VoteObject} from "../entity/Vote";
import * as _ from 'underscore';
import Roles from "../entity/Roles";
import GameStatusReducer from "./GameStatusReducer";


export default function GameReducer (state: GameState<GameStatus> = InitialGameState, action: IGameAction): GameState<GameStatus> {
    switch(action.type) {
        case GameAction.CREATE_GAME:
            return getNewState(InitialGameState, ['time_create', 'time_last_update', 'time_last_update_players'], {
                status: GameStatus.START_THE_GAME,
                players: action.payload.players
            });

        case GameAction.NEXT_GAME_STEP:
            return  GameStatusReducer(state, action);

        case GameAction.VOTE:
            // Если токен который голосует отсутствует в коллекции голосующих ничего не делаем
            if(state.votes.length && !~_.pluck(state.votes, 'who_token').indexOf(action.payload.who_token)) {
                return state;
            }

            return getNewState(state, [], {
                votes: state.votes.map((vote: VoteObject) => {
                    return action.payload.who_token === vote.who_token ? _.extend({for_whom_token: action.payload.for_whom_token}, vote) : vote;
                })
            });

        default:
            return state;
    }
}