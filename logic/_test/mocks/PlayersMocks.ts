import {Player, GamePlayer} from "../../src/entity/Player";
import Roles from "../../src/entity/Roles";

export const INITIAL_NAME = 'Bob';
export const INITIAL_AVATAR = '/avatar.png';
export const INITIAL_TOKEN = 'a257dc9';

export function  getPlayer({name = INITIAL_NAME, avatar = INITIAL_AVATAR, token = INITIAL_TOKEN} = {}): Player {
    return {name, avatar, token};
}

export function  getGamePlayer({name = INITIAL_NAME, avatar = INITIAL_AVATAR, token = INITIAL_TOKEN, role = Roles.INHABITANT} = {}): GamePlayer {
    return {name, avatar, token, role};
}

export function getGamePlayerArray(len: number): Array<GamePlayer> {
    return Array.apply(null, {length: len}).map(() => getGamePlayer());
}