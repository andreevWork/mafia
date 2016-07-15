import {Player, GamePlayer} from "./Player";
import {VoteObject} from "./Vote";
import Roles from "./Roles";
import {GameStatus} from "./GameStatus";
import RoomStatus from "./RoomStatus";
import * as _ from 'underscore';

interface BaseState<Status> {
    time_last_update: number;
    time_create: number;
    status: Status;
    time_last_update_players: number;
}

export interface RoomState<Status> extends BaseState<Status> {
    players: Array<Player>;
    is_ready: boolean;
    token?: string;
    public_url?: string;
}


export interface GameState<Status> extends BaseState<Status> {
    players: Array<GamePlayer>;
    round_number: number;
    vote_variants: Array<string>;
    votes: Array<VoteObject>;
    active_roles: Array<Roles>;
    round_data: RoundData;
    prev_round_healing?: string; // token игрока которого доктор лечил в прошлом раунде
    win_role?: Roles; // Роль которая, выйграла игру
}

export interface RoundData {
    execution?: string; // token игрока которого казнили
    killed?: Array<string>; // token игрока убитого утром
    healing?: string; // token игрока которого лечил доктор
    real_man?: string; // token игрока с которым переспала путана
    mafia_target?: string; // token игрока убитого ночь мафией
}


export const InitialGameState: GameState<GameStatus> = {
    time_last_update: 0,
    time_last_update_players: 0,
    time_create: 0,
    status: null,
    players: [],
    active_roles: null,
    round_number: 0,
    vote_variants: [],
    votes: [],
    round_data: null
};

export const InitialRoomState: RoomState<RoomStatus> = {
    time_last_update: 0,
    time_last_update_players: 0,
    time_create: 0,
    status: null,
    players: [],
    is_ready: false
};

/*
 * Простой вспомогательный метод, для генерации нового состояния store. Принимает старое состояние, новую часть будущего состояния, и массив ключей для временных отметок
 */

export function getNewState<State>(old_state: State, time_keys: Array<string>, piece_of_new_state: _.Dictionary<any>): State {
    let time_state:  _.Dictionary<number> = {};
    time_keys.forEach((time_key: string) => {time_state[time_key] = Date.now()});

    return _.extend({}, old_state, time_state, piece_of_new_state);
}