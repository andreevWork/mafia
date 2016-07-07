import {GamePlayer} from "./Player";
import Roles from "./Roles";

enum GameStatus {
    DAY_AFTER_NIGHT,
    DAY_BEFORE_NIGHT,

    FAll_ASLEEP_INHABITANT,
    WAKE_UP_INHABITANT,
    VOTE_INHABITANT,

    FAll_ASLEEP_MAFIA,
    WAKE_UP_MAFIA,
    VOTE_MAFIA,

    FAll_ASLEEP_DOCTOR,
    WAKE_UP_DOCTOR,
    VOTE_DOCTOR,

    FAll_ASLEEP_COMMISSAR,
    WAKE_UP_COMMISSAR,
    VOTE_COMMISSAR,

    FAll_ASLEEP_WHORE,
    WAKE_UP_WHORE,
    VOTE_WHORE
}

namespace GameStatus {
    export function isVote(game_state: GameStatus) {
        return game_state === GameStatus.VOTE_INHABITANT ||
            game_state === GameStatus.VOTE_MAFIA ||
            game_state === GameStatus.VOTE_DOCTOR ||
            game_state === GameStatus.VOTE_WHORE ||
            game_state === GameStatus.VOTE_COMMISSAR;
    }

    export function getVotePredicat(game_state: GameStatus, is_variants: boolean = false): vote_predicat {
        switch(game_state) {
            case GameStatus.VOTE_MAFIA:
                return is_variants ? (player:GamePlayer) => !Roles.isMafia(player.role) :
                    (player:GamePlayer) => Roles.isMafia(player.role);

            case GameStatus.VOTE_DOCTOR:
                return is_variants ? (player:GamePlayer) => !Roles.isDoctor(player.role) :
                    (player:GamePlayer) => Roles.isDoctor(player.role);

            case GameStatus.VOTE_WHORE:
                return is_variants ? (player:GamePlayer) => !Roles.isWhore(player.role) :
                    (player:GamePlayer) => Roles.isWhore(player.role);

            case GameStatus.VOTE_COMMISSAR:
                return is_variants ? (player:GamePlayer) => !Roles.isCommissar(player.role) :
                    (player:GamePlayer) => Roles.isCommissar(player.role);

            default:
                return (player:GamePlayer) => true;
        }
    }
}

export type vote_predicat = (player: GamePlayer) => boolean;

export default GameStatus;