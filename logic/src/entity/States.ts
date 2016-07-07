import {Player, GamePlayer, GameOffPlayer} from "./Player";
import {VoteObject} from "./Vote";
import Roles from "./Roles";

interface BaseState<Status> {
    time_last_update: number;
    time_create: number;
    status: Status;
}

export interface RoomState<Status> extends BaseState<Status> {
    players: Array<Player>;
}


export interface GameState<Status> extends BaseState<Status> {
    time_last_update_players: number;
    players: Array<GamePlayer>;
    round_number: number;
    vote_variants: Array<GamePlayer>;
    active_role: Roles;
    votes: Array<VoteObject>
}