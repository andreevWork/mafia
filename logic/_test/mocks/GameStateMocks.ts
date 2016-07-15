import {GameState, getNewState, InitialGameState, RoundData} from "../../src/entity/States";
import {GameStatus} from "../../src/entity/GameStatus";
import {VoteObject} from "../../src/entity/Vote";
import {GamePlayer} from "../../src/entity/Player";
import {getGamePlayer} from "./PlayersMocks";

export function getGameStateAfterVote(votes_array: Array<VoteObject>, vote_variants: Array<string> = ['23434', '32432', 'r43et43'], players_array?: Array<GamePlayer>): GameState<GameStatus> {
    return getNewState(InitialGameState, [], {votes: votes_array, vote_variants: vote_variants, players: players_array});
}

export function getGameStateWithPlayers(players_array: Array<GamePlayer>): GameState<GameStatus> {
    return getNewState(InitialGameState, [], {players: players_array});
}

export function getGameStateWithPlayersAndExecution(players_array: Array<GamePlayer>, execution: string): GameState<GameStatus> {
    return getNewState(InitialGameState, [], {players: players_array, round_data: {execution}});
}

export function getGameStateWithPlayersAndPrevRoundHealing(players_array: Array<GamePlayer>, prev_round_healing: string): GameState<GameStatus> {
    return getNewState(InitialGameState, [], {players: players_array, prev_round_healing});
}

export function getGameStateAfterNight(round_data: RoundData, players: Array<GamePlayer> = [getGamePlayer(), getGamePlayer()]): GameState<GameStatus> {
    return getNewState(InitialGameState, [], {round_data, players});
}
