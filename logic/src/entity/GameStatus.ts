import {GamePlayer} from "./Player";
import Roles from "./Roles";
import {GameState} from "./States";
import * as _ from 'underscore';

export enum GameStatus {
    START_THE_GAME,
    DAY_AFTER_NIGHT,
    DAY_BEFORE_NIGHT,

    WAKE_UP_INHABITANT,
    VOTE_INHABITANT,
    FALL_ASLEEP_INHABITANT,

    WAKE_UP_MAFIA,
    VOTE_MAFIA,
    FALL_ASLEEP_MAFIA,

    WAKE_UP_DOCTOR,
    VOTE_DOCTOR,
    FALL_ASLEEP_DOCTOR,

    WAKE_UP_WHORE,
    VOTE_WHORE,
    FALL_ASLEEP_WHORE,

    WAKE_UP_COMMISSAR,
    VOTE_COMMISSAR,
    FALL_ASLEEP_COMMISSAR
}

export namespace GameStatusHelpers {
    /*
     * Метод определения активной роли для текущего статуса игры
     * Активная роль - это те игроки которым необходимо что-либо сделать в текущем состоянии игры
     * Поскольку вся игра сводится к череде голосований и выборов, то активные роли бывают только в момент голосования.
     */
    export function getActiveRole(game_status: GameStatus): Array<Roles> {
        switch (game_status) {
            case GameStatus.VOTE_MAFIA:
                return [Roles.MAFIA];

            case GameStatus.VOTE_DOCTOR:
                return [Roles.DOCTOR];

            case GameStatus.VOTE_WHORE:
                return [Roles.WHORE];

            case GameStatus.VOTE_COMMISSAR:
                return [Roles.COMMISSAR];

            case GameStatus.VOTE_INHABITANT:
                return [Roles.MAFIA, Roles.DOCTOR, Roles.INHABITANT, Roles.WHORE, Roles.COMMISSAR];

            default:
                return null;
        }                
    }
    
    /*
     * Метод, который на основании текущего состояния, отдаст следующий статус для игры
     */
    export function getNextStatus(state: GameState<GameStatus>): GameStatus {
        switch (state.status) {
            // После начала игры наступает первая ночь и каждый раз после конца дня
            case GameStatus.START_THE_GAME:
            case GameStatus.DAY_BEFORE_NIGHT:
                return GameStatus.FALL_ASLEEP_INHABITANT;

            case GameStatus.WAKE_UP_INHABITANT:
                return GameStatus.DAY_AFTER_NIGHT;

            case GameStatus.DAY_AFTER_NIGHT:
                return GameStatus.VOTE_INHABITANT;

            case GameStatus.VOTE_INHABITANT:
                return GameStatus.DAY_BEFORE_NIGHT;

            case GameStatus.FALL_ASLEEP_INHABITANT:
                return GameStatus.WAKE_UP_MAFIA;

            case GameStatus.WAKE_UP_MAFIA:
                return GameStatus.VOTE_MAFIA;
            
            case GameStatus.VOTE_MAFIA:
                return GameStatus.FALL_ASLEEP_MAFIA;

            case GameStatus.WAKE_UP_DOCTOR:
                return GameStatus.VOTE_DOCTOR;

            case GameStatus.VOTE_DOCTOR:
                return GameStatus.FALL_ASLEEP_DOCTOR;

            case GameStatus.WAKE_UP_WHORE:
                return GameStatus.VOTE_WHORE;

            case GameStatus.VOTE_WHORE:
                return GameStatus.FALL_ASLEEP_WHORE;

            case GameStatus.WAKE_UP_COMMISSAR:
                return GameStatus.VOTE_COMMISSAR;

            case GameStatus.VOTE_COMMISSAR:
                return GameStatus.FALL_ASLEEP_COMMISSAR;

            case GameStatus.FALL_ASLEEP_COMMISSAR:
                return GameStatus.WAKE_UP_INHABITANT;

            case GameStatus.FALL_ASLEEP_MAFIA:
                if(_.findWhere(state.players, {role: Roles.DOCTOR})) {
                    return GameStatus.WAKE_UP_DOCTOR
                }

                if(_.findWhere(state.players, {role: Roles.WHORE})) {
                    return GameStatus.WAKE_UP_WHORE
                }

                if(_.findWhere(state.players, {role: Roles.COMMISSAR})) {
                    return GameStatus.WAKE_UP_COMMISSAR
                }

                return GameStatus.WAKE_UP_INHABITANT;

            case GameStatus.FALL_ASLEEP_DOCTOR:
                if(_.findWhere(state.players, {role: Roles.WHORE})) {
                    return GameStatus.WAKE_UP_WHORE
                }

                if(_.findWhere(state.players, {role: Roles.COMMISSAR})) {
                    return GameStatus.WAKE_UP_COMMISSAR
                }

                return GameStatus.WAKE_UP_INHABITANT;

            case GameStatus.FALL_ASLEEP_WHORE:
                if(_.findWhere(state.players, {role: Roles.COMMISSAR})) {
                    return GameStatus.WAKE_UP_COMMISSAR
                }

                return GameStatus.WAKE_UP_INHABITANT;
        }
    }
}