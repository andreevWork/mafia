import {GameState} from "../entity/States";
import GameAction, {IGameAction} from "../actions/GameAction";
import {GameStatus, GameStatusHelpers} from "../entity/GameStatus";
import {GamePlayer} from "../entity/Player";
import {VoteObject} from "../entity/Vote";
import * as _ from 'underscore';
import Roles from "../entity/Roles";

export const InitialGameState: GameState<GameStatus> = {
    time_last_update: 0,
    time_last_update_players: 0,
    time_create: 0,
    status: null,
    players: [],
    active_role: null,
    round_number: 0,
    vote_variants: [],
    votes: []
};

export default function GameReducer (state: GameState<GameStatus> = InitialGameState, action: IGameAction): GameState<GameStatus> {
    switch(action.type) {
        case GameAction.CREATE_GAME:
            return _.extend({}, state, {
                time_create: Date.now(),
                time_last_update: Date.now(),
                time_last_update_players: Date.now(),
                status: GameStatus['DAY_BEFORE_NIGHT'],
                players: action.payload.players
            });

        case GameAction.NEXT_GAME_STEP:
            let vote_variants: Array<GamePlayer>  = [],
                votes: Array<VoteObject> = [],
                active_role: Roles = GameStatusHelpers.getActiveRole(action.payload.status),
                time_last_update_players = state.time_last_update_players;

            if(active_role !== null) {
                vote_variants = state.players
                    // Убираем из голосования всех игроков с актвиной ролью
                    .filter((player: GamePlayer) => active_role !== player.role)
                    // Удаляем роль игрока т. к. эта информация будет отослана все голосующим игрокам
                    .map((player: GamePlayer) => { delete player.role; return player; });
                
                votes = state.players
                    // Голосовать могут только игроки активной роли
                    .filter((player: GamePlayer) => active_role === player.role)
                    // На каждого игрока создаем объект с данными по голосованию
                    .map((player: GamePlayer) => ({who_token: player.token, for_whom_token: null}));

                time_last_update_players = Date.now();
            }

            return _.extend({}, state, {
                time_last_update: Date.now(),
                status: action.payload.status,
                vote_variants,
                votes,
                time_last_update_players
            });

        case GameAction.VOTE:
            // Если токен который голосует отсутствует в коллекции голосующих ничего не делаем
            if(state.votes.length && !~_.pluck(state.votes, 'who_token').indexOf(action.payload.who_token)) {
                return state;
            }
            
            return _.extend({}, state, {
                votes: state.votes.map((vote: VoteObject) => {
                    return action.payload.who_token === vote.who_token ? _.extend({}, vote, {for_whom_token: action.payload.for_whom_token}) : vote;
                })
            });

        default:
            return state;
    }
}