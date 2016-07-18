import Roles from "./Roles";
import * as _ from 'underscore';
import {GameStatus} from "./GameStatus";
import {MIN_PLAYERS, STEP_CHANGE_ROLES} from "./GameEnvironment";

export interface Player {
    name: string;
    avatar?: string;
    token: string;
}

export interface GamePlayer extends Player {
    role: Roles;
}

export namespace Player {
    export const Avatars = {
        path: '/public/img/avatars/',
        variants: [
            'lady.png',
            'black.png'
        ]
    };


    /*
     * Функция для добавления ролей игрокам
     * Краткий принцип работы:
     * Есть минимальное число игроков - MIN_PLAYERS
     * Есть шаг через который изменяется число активных ролей - STEP_CHANGE_ROLES
     * На основании этих констант и общего числа игроков определяется число итераций в цикле - steps
     * Перед запуском цикла все игроки перемешиваются и всем игрокам проставляется роль - житель, которая в результате работы цикла может быть изменена.
     * На каждой итерации цикла происходит следующее:
         * Игроку присуждается роль мафии
         * Одному игроку присуждается роль доктора
         * На второй итерации одному игроку присуждается роль коммиссара
         * На четвертой итерации одному игроку присуждается роль путаны
         * После добавления очередной роли игроку, индекс увеличываестя и следцющая роль запишется другому игроку.
     */
    export function RolesForPlayers(players: Array<Player>): Array<GamePlayer>{
        let steps: number = Math.floor((players.length - MIN_PLAYERS) / STEP_CHANGE_ROLES) + 1,
            game_players: Array<GamePlayer> = _.shuffle(players).map((player: Player) => _.extend({role: Roles.INHABITANT}, player)),
            flag_commissar = false,
            index: number = 0;

        game_players[index++].role = Roles.DOCTOR;
        game_players[index++].role = Roles.WHORE;

        while(steps--) {
            game_players[index++].role = Roles.MAFIA;

            if(steps % 2 !== 0) {
                if(!flag_commissar) {
                    game_players[index++].role = Roles.COMMISSAR;
                    flag_commissar = true;
                }
            }
        }

        return game_players;
    }

    /*
     * Функциия принимает массив игроков, и необязательный параметр какой игрок будет удален, на выходе скажет, будет ли число мафий и остальных ролей равно
     */
    export function isEqualMafiaAndOthers(players: Array<GamePlayer> = [], remove_in_future_token?:string): boolean {
        let mafia_count: number = 0,
            others_count: number = 0;

        players.forEach((player: GamePlayer) => {
            if(remove_in_future_token === player.token) return;

           if(player.role === Roles.MAFIA) {
               mafia_count++;
           }  else {
               others_count++;
           }
        });

        return players.length && mafia_count === others_count;
    }

    export function hasMafia(players: Array<GamePlayer> = [], remove_in_future_token?:string): boolean {
        let mafia_count: number = 0;

        players.forEach((player: GamePlayer) => {
            if(remove_in_future_token === player.token) return;

            if(player.role === Roles.MAFIA) {
                mafia_count++;
            }
        });

        return players.length && !!mafia_count;
    }
}



