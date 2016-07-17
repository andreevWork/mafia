import {GameStatus, GameStatusHelpers} from '../../src/entity/GameStatus';
import Roles from "../../src/entity/Roles";
import {getNewState, InitialGameState, GameState} from "../../src/entity/States";
import {GamePlayer} from "../../src/entity/Player";
import {getGamePlayer} from "../mocks/PlayersMocks";

describe('GameStatus', () => {
    
    it('getActiveRole', () => {
        expect(GameStatusHelpers.getActiveRole(GameStatus.VOTE_MAFIA)).toEqual([Roles.MAFIA]);
        expect(GameStatusHelpers.getActiveRole(GameStatus.VOTE_DOCTOR)).toEqual([Roles.DOCTOR]);
        expect(GameStatusHelpers.getActiveRole(GameStatus.VOTE_INHABITANT)).toEqual([Roles.MAFIA, Roles.DOCTOR, Roles.INHABITANT, Roles.WHORE, Roles.COMMISSAR]);
        expect(GameStatusHelpers.getActiveRole(GameStatus.DAY_AFTER_NIGHT)).toBeNull();
        expect(GameStatusHelpers.getActiveRole(GameStatus.WAKE_UP_INHABITANT)).toBeNull();
    });

    describe('getNextStatus', () => {
        let state: GameState;

        it('при самом начальном статусе игры, следующий статус, начало первой ночи, то есть город засыпает', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.START_THE_GAME});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_INHABITANT);
        });

        it('после того как город уснул, всегда просыпается мафия, т. к. мафия в игре есть всегда', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_INHABITANT});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_MAFIA);
        });

        it('после пробуждения мафия голосует', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.WAKE_UP_MAFIA});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.VOTE_MAFIA);
        });

        it('после голосования мафия засыпает', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.VOTE_MAFIA});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_MAFIA);
        });

        it('после того как уснула мафия просыпается доктор, если он имеется в ролях', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.WHORE}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_MAFIA, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_DOCTOR);
        });

        it('после пробуждения доктор голосует', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.WAKE_UP_DOCTOR});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.VOTE_DOCTOR);
        });

        it('после голосования доктор засыпает', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.VOTE_DOCTOR});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_DOCTOR);
        });

        it('после того как уснула мафия просыпается путана, если нет доктора, а она имеется', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.WHORE}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_MAFIA, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_WHORE);
        });

        it('после пробуждения путана голосует', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.WAKE_UP_WHORE});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.VOTE_WHORE);
        });

        it('после голосования путана засыпает', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.VOTE_WHORE});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_WHORE);
        });

        it('после того как уснула мафия просыпается коммиссар, если нет ни доктора, ни путаны, а он имеется', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.COMMISSAR}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_MAFIA, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_COMMISSAR);
        });

        it('после пробуждения коммиссар голосует', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.WAKE_UP_COMMISSAR});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.VOTE_COMMISSAR);
        });

        it('после голосования коммиссар засыпает', () => {
            state = getNewState(InitialGameState, [], {status: GameStatus.VOTE_COMMISSAR});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_COMMISSAR);
        });

        it('после того как уснул доктор просыпается путана, если она имеется', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.COMMISSAR}),
                getGamePlayer({role: Roles.WHORE}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_DOCTOR, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_WHORE);
        });

        it('после того как уснул доктор просыпается коммиссар, если нет путаны, а он имеется', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.COMMISSAR}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_DOCTOR, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_COMMISSAR);
        });

        it('после того как уснула путана засыпает, просыпается коммиссар, если он имеется', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.COMMISSAR}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_WHORE, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_COMMISSAR);
        });

        it('после того как уснула мафия, если больше вообще нет действующих лиц город просыпается', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_MAFIA, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_INHABITANT);
        });


        it('после того как уснул доктор, если больше вообще нет действующих лиц город просыпается', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_DOCTOR, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_INHABITANT);
        });

        it('после того как уснула путана, если больше вообще нет действующих лиц город просыпается', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_WHORE, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_INHABITANT);
        });

        it('после того как уснул коммисар, город просыпается', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.FALL_ASLEEP_COMMISSAR, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.WAKE_UP_INHABITANT);
        });

        it('после того как город проснулся, начинается день перед голосованием', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.WAKE_UP_INHABITANT, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.DAY_AFTER_NIGHT);
        });

        it('после первой половины дня начинается голосование', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.DAY_AFTER_NIGHT, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.VOTE_INHABITANT);
        });

        it('после дневного голосования, начинается вторая половина дня', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.VOTE_INHABITANT, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.DAY_BEFORE_NIGHT);
        });

        it('после второй половины дня вновь начинается новая ночь и город засыпает', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
            ];

            state = getNewState(InitialGameState, [], {status: GameStatus.DAY_BEFORE_NIGHT, players});

            expect(GameStatusHelpers.getNextStatus(state)).toEqual(GameStatus.FALL_ASLEEP_INHABITANT);
        });
    });
});