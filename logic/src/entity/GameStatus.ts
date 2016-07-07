import {GamePlayer} from "./Player";
import Roles, {RolesKeys} from "./Roles";

export type GameStatus = 'game_status';

export const GameStatus: _.Dictionary<GameStatus> = {
    DAY_AFTER_NIGHT: 'day_after_night' as GameStatus,
    DAY_BEFORE_NIGHT: 'day_before_night' as GameStatus
};

const vote_prefix = 'vote_';
const asleep_prefix = 'fall_asleep_';
const wakeup_prefix = 'wake_up_';

RolesKeys.forEach((key: string) => {
    GameStatus[`${asleep_prefix.toUpperCase()}${key}`] = `${asleep_prefix}${key.toLowerCase()}` as GameStatus;
    GameStatus[`${wakeup_prefix.toUpperCase()}${key}`] = `${wakeup_prefix}${key.toLowerCase()}` as GameStatus;
    GameStatus[`${vote_prefix.toUpperCase()}${key}`] = `${vote_prefix}${key.toLowerCase()}` as GameStatus;
});

export namespace GameStatusHelpers {
    /*
     * Метод определения активной роли для текущего статуса игры
     * Активная роль - это те игроки которым необходимо что-либо сделать в текущем состоянии игры
     * Поскольку вся игра сводится к череде голосований и выборов, то активные роли бывают только в момент голосования.
     */
    export function getActiveRole(game_status: GameStatus): Roles {
        // Если статус игры не некое голосование - активных ролей нет
        if(!(~game_status.indexOf('vote'))) {
            return null;
        }

        return Roles[game_status.replace(vote_prefix, '').toUpperCase()];
    }
}