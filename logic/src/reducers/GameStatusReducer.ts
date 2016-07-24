import {GameState, InitialGameState, getNewState, RoundData} from "../entity/States";
import GameAction, {IGameAction} from "../actions/GameAction";
import {GameStatus, GameStatusHelpers} from "../entity/GameStatus";
import {GamePlayer, Player} from "../entity/Player";
import {VoteObject} from "../entity/Vote";
import * as _ from 'underscore';
import Roles from "../entity/Roles";
import {getMaxRepeatValue} from "../utils/helpers";

/*
 * На самом деле это не самостоятельный редьюсер, а часть другого редьюсера, но было решено вынести логику по работе с разными игровыми статусами 
 * в отдельный редьюсер
 */



export default function GameStatusReducer (state: GameState = InitialGameState, action: IGameAction): GameState {
    let round_data: RoundData = state.round_data || {};
    let players: Array<GamePlayer> = state.players;
    let win_role: Roles;

    switch(action.payload.status) {
        /*
         * Статус после дневного голосования, когда решают кого казнить
         */
        case GameStatus.DAY_BEFORE_NIGHT:
            let execution: string = '';
            // Если массив голосования не пуст, значит было голосование кого казнить, необходимо обработать результат
            if(state.votes.length) {
                // Забираем из массива все голоса за игроков, и сразу находим среди них за кого отдали большее число голосов
                execution = getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token'));
            }

            if( Player.isEqualMafiaAndOthers(state.players, execution)) {
                win_role = Roles.MAFIA;
            }

            if( !Player.hasMafia(state.players, execution)) {
                win_role = Roles.INHABITANT;
            }
            
            return getNewState(state, ['time_last_update', 'time_last_update_players'], {
                status: action.payload.status,
                round_data: {execution},
                votes: [],
                vote_variants: [],
                win_role,
                active_roles: null
            });


        /*
         * Статус, перед дневныи голосованием, только удаляет убитых ночью игроков из партии
         */
        case GameStatus.DAY_AFTER_NIGHT:
            // Если кого-то ночью убили, убираем его из игроков
            if(!_.isEmpty(round_data.killed)) {
                players = players.filter((player: GamePlayer) => !~round_data.killed.indexOf(player.token));
            }

            if( Player.isEqualMafiaAndOthers(players)) {
                win_role = Roles.MAFIA;
            }
            
            return getNewState(state, ['time_last_update'], {
                status: action.payload.status,
                players: players,
                win_role
            });


        /*
         * Статус когда город засыпает, конец дня и по сути раунда, очищается вся инфа о раунде, его номер увеличивается на один
         * Также удаляется казненый игрок из массива игроков
         */
        case GameStatus.FALL_ASLEEP_INHABITANT:
            // Если кого-то днем казнили удаляем его из игроков
            if(state.round_data && state.round_data.execution) {
                players = players.filter((player: GamePlayer) => player.token !== state.round_data.execution);
            }

            return getNewState(state, ['time_last_update'], {
                status: action.payload.status,
                round_data: null,
                players: players,
                round_number: ++state.round_number
            });

        /*
         * При наступлении этого статуса идет рассчет, кого убили, убили ли вообще и т. п.
         */
        case GameStatus.WAKE_UP_INHABITANT:
            round_data = _.clone(state.round_data);
            round_data.killed = [];
            // Мафия стреляет и смертельно ранит игрока
            round_data.killed = round_data.killed.concat(round_data.mafia_target);

            // Если мафия пришла убивать путану, тогда заодно они убьют и ее клиента
            let whore: GamePlayer = _.findWhere(state.players, {role: Roles.WHORE});
            if(whore && whore.token === round_data.mafia_target && _.findWhere(state.players, {token: round_data.real_man}).role !== Roles.MAFIA) {
                round_data.killed = round_data.killed.concat(round_data.real_man);
            }

            // Если же мафия пришла за персонажем а он спит с путаной, убивать будет не кого
            if(round_data.mafia_target === round_data.real_man) {
                round_data.killed = [];
            }

            // Если в кого-то стреляли, то в самый последний момент его, и только его, может спасти доктор
            if(~round_data.killed.indexOf(round_data.healing)) {
                round_data.killed = _.without(round_data.killed, round_data.healing);
            }

            return getNewState(state, ['time_last_update', 'time_last_update_players'], {
                status: action.payload.status,
                round_data
            });
        
        /*
         * Статусы с различными голосовалками, здесь назначается активная/ые роль/и
         * Также  добавляется массив вариантов для голосования и массив с голосуещими
         */
        case GameStatus.VOTE_COMMISSAR:
        case GameStatus.VOTE_MAFIA:
        case GameStatus.VOTE_INHABITANT:
        case GameStatus.VOTE_DOCTOR:
        case GameStatus.VOTE_WHORE:
            let active_roles: Array<Roles> = GameStatusHelpers.getActiveRole(action.payload.status),

                vote_variants: Array<string>  =  state.players
                    // Убираем из голосования всех игроков с активными ролями, например в голосовании мафии нельзя голосовать против мафии
                    .filter((player: GamePlayer) => {
                        // Прикол в том что, доктор имеет права лечить все персонажей включая себя
                        if(GameStatus.VOTE_DOCTOR === action.payload.status) {
                            return state.prev_round_healing ? state.prev_round_healing !==  player.token : true;
                        } 
                        
                        if(GameStatus.VOTE_INHABITANT === action.payload.status) {
                            return true;
                        }

                        return !~active_roles.indexOf(player.role);
                    })
                    // Отдаем только токен, потом по нему получим нудные свойства игрока
                    .map((player: GamePlayer) => { return player.token; }),

                votes: Array<VoteObject> = state.players
                    // Голосовать могут только игроки активной роли
                    .filter((player: GamePlayer) => !!~active_roles.indexOf(player.role))
                    // На каждого игрока создаем объект с данными по голосованию
                    .map((player: GamePlayer) => ({who_token: player.token}));
            
            return getNewState(state, ['time_last_update', 'time_last_update_players'], {
                status: action.payload.status,
                active_roles,
                vote_variants,
                votes
            });

        /*
         * Статус после голосования определенных ролей, запоминаем результат, чистим данные по голосованию
         */
        case GameStatus.FALL_ASLEEP_MAFIA:
        case GameStatus.FALL_ASLEEP_DOCTOR:
        case GameStatus.FALL_ASLEEP_WHORE:
            // Забираем из массива все голоса за игроков, и сразу находим среди них за кого отдали большее число голосов
            let vote_result: string = getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token')),
                prev_round_healing: string;
            
            switch (action.payload.status) {
                case GameStatus.FALL_ASLEEP_DOCTOR:
                    round_data.healing = prev_round_healing = vote_result;
                    break;

                case GameStatus.FALL_ASLEEP_MAFIA:
                    round_data.mafia_target = vote_result;
                    break;

                case GameStatus.FALL_ASLEEP_WHORE:
                    round_data.real_man = vote_result;
                    break;
            }

            return getNewState(state, ['time_last_update'], {
                status: action.payload.status,
                round_data,
                prev_round_healing,
                votes: [],
                vote_variants: [],
                active_roles: null
            });

        /*
         * Выбор коммисара никому не интересен, он просто спрашивает, пожтому просто чистим нудные поля
         */
        case GameStatus.FALL_ASLEEP_COMMISSAR:
            return getNewState(state, ['time_last_update'], {
                status: action.payload.status,
                votes: [],
                vote_variants: [],
                active_roles: null
            });

        /*
         * Есть статусы которые по факту ничего не делают, они просто меняются, и в большинстве случаев
         * это нужно для правильной очередности проигрывания аудифайлов на клиенте
         */
        case GameStatus.WAKE_UP_MAFIA:
        case GameStatus.WAKE_UP_DOCTOR:
        case GameStatus.WAKE_UP_WHORE:
        case GameStatus.WAKE_UP_COMMISSAR:
            return getNewState(state, ['time_last_update'], {
                status: action.payload.status
            });

        default:
            return state;
    }
}