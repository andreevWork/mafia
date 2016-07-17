import GameStatusReducer from '../../src/reducers/GameStatusReducer';
import {GameState, InitialGameState, RoundData} from '../../src/entity/States';
import {GameStatusHelpers, GameStatus} from '../../src/entity/GameStatus';
import GameAction from "../../src/actions/GameAction";
import {Player, GamePlayer} from "../../src/entity/Player";
import {getGamePlayerArray, getGamePlayer, INITIAL_TOKEN} from "../mocks/PlayersMocks";
import {
    getGameStateAfterVote, getGameStateWithPlayers,
    getGameStateWithPlayersAndExecution, getGameStateWithPlayersAndPrevRoundHealing, getGameStateAfterNight
} from "../mocks/GameStateMocks";
import Roles from "../../src/entity/Roles";
import * as _ from 'underscore';
import {VoteObject} from "../../src/entity/Vote";


describe('GameStatusReducer', () => {
    let state: GameState,
        status: GameStatus,
        now: number;

    beforeEach(() => {
        now = Date.now();
    });

    it('DAY_BEFORE_NIGHT - наступает после голосования за казнь, необходимо подсчитать кого казнить, очистить данные по голосованию', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            token_3 = 'rwefe32',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2},
                {who_token: token_2, for_whom_token: token_3},
                {who_token: token_3, for_whom_token: token_2}
            ];

        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.INHABITANT})
        ];
        
        status = GameStatus.DAY_BEFORE_NIGHT;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array, undefined, players), GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
        // Должен вычислить за кого больше проголосовали и записать в соответствующее место
        expect(state.round_data.execution).toBe(token_2);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);
        expect(state.win_role).toBeUndefined();
    });

    it('DAY_BEFORE_NIGHT - если после казни число мафии и остальных ролей равно игра окончена, в пользу мафии', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            token_3 = 'rwefe32',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2},
                {who_token: token_2, for_whom_token: token_3},
                {who_token: token_3, for_whom_token: token_2}
            ];
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.INHABITANT, token: token_2})
        ];

        status = GameStatus.DAY_BEFORE_NIGHT;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array, undefined, players), GameAction.nextGameStep(status));

        expect(state.win_role).toEqual(Roles.MAFIA);
    });

    it('DAY_BEFORE_NIGHT - если после казни мафий не остается выигрывают мирные жители', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            token_3 = 'rwefe32',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2},
                {who_token: token_2, for_whom_token: token_3},
                {who_token: token_3, for_whom_token: token_2}
            ];
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.DOCTOR}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA, token: token_2})
        ];

        status = GameStatus.DAY_BEFORE_NIGHT;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array, undefined, players), GameAction.nextGameStep(status));

        expect(state.win_role).toEqual(Roles.INHABITANT);
    });



    it('FALL_ASLEEP_INHABITANT - город засыпает, очишается вся информации о преидущем дне, увеличть номер раунда на один', () => {
        let players: Array<GamePlayer> = getGamePlayerArray(5);

        status = GameStatus.FALL_ASLEEP_INHABITANT;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);

        // Должен вычислить за кого больше проголосовали и записать в соответствующее место
        expect(state.round_data).toBeNull();
        expect(state.round_number).toBe(1);
    });

    it('FALL_ASLEEP_INHABITANT - город засыпает казненый игрок удаляется из массива с игроками', () => {
        let token_1 = '2342',
            token_2 = 'erewre',
            players: Array<GamePlayer> = [
                getGamePlayer({token: token_1}),
                getGamePlayer({token: token_2}),
                getGamePlayer({token: token_2})
            ];

        status = GameStatus.FALL_ASLEEP_INHABITANT;
        state =  GameStatusReducer(getGameStateWithPlayersAndExecution(players, token_1), GameAction.nextGameStep(status));

        expect(_.findWhere(state.players, {token: token_1})).toBeUndefined();
    });

    it('WAKE_UP_MAFIA - просыпается мафия, просто меняем статус', () => {

        status = GameStatus.WAKE_UP_MAFIA;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
    });

    it('VOTE_MAFIA - мафия голосует, должна появится активная роль мафия, проапдейтится время для апдейта игроков', () => {

        status = GameStatus.VOTE_MAFIA;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.active_roles).toEqual(GameStatusHelpers.getActiveRole(status));
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
    });

    it('VOTE_MAFIA - мафия голосует, должен сформироваться массив из вариантов голосования и массив голосующих', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        status = GameStatus.VOTE_MAFIA;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.vote_variants.length).toBe(3);
        expect(state.votes.length).toBe(1);
    });

    it('FALL_ASLEEP_MAFIA - после того как все проголосуют мафия засыпает, необходимо подсчитать кого убили, проапдейтить главное время, очистить данные по голосованию', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            token_3 = 'rwefe32',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2},
                {who_token: token_2, for_whom_token: token_3},
                {who_token: token_3, for_whom_token: token_2}
            ];

        status = GameStatus.FALL_ASLEEP_MAFIA;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array), GameAction.nextGameStep(status));

        expect(state.round_data.mafia_target).toBe(token_2);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);
        expect(state.active_roles).toBeNull();
    });

    it('WAKE_UP_DOCTOR - просыпается доктор, просто меняем статус', () => {

        status = GameStatus.WAKE_UP_DOCTOR;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
    });

    it('VOTE_DOCTOR - доктор выбирает кого будет лечить, должа измениться активная роль, и проавпдейтиться игроковое время', () => {

        status = GameStatus.VOTE_DOCTOR;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.active_roles).toEqual(GameStatusHelpers.getActiveRole(status));
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
    });

    it('VOTE_DOCTOR - доктор выбирает кого лечить, массив вариантов - все живые игроки, т.к.  доктор может лечить сам себя, голосующий один доктор', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        status = GameStatus.VOTE_DOCTOR;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.vote_variants.length).toBe(4);
        expect(state.votes.length).toBe(1);
    });

    it('VOTE_DOCTOR - доктор выбирает кого лечить, если второй и далее раунд, то нельзя исцелять одного игрока два раза подряд', () => {
        let token_1 = '23erefw',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
                // Добавлем доктор свой токен
                getGamePlayer({role: Roles.DOCTOR, token: token_1})
            ];

        status = GameStatus.VOTE_DOCTOR;
        // И создаем тестовое состояние где, в предидущий раунж доктор хилим сам себе
        state =  GameStatusReducer(getGameStateWithPlayersAndPrevRoundHealing(players, token_1), GameAction.nextGameStep(status));
        // В этом состоянии доктора в вариантах голосования быть не должно
        expect(state.vote_variants).not.toContain(token_1);
    });

    it('FALL_ASLEEP_DOCTOR - после выбора кого хилить, пишем выбор в инфа пишется в объект раунда, чистится инфа по голосованию, также должно записаться кого похилил в специальное свойство prev_round_healing, для дальнейшего сравнения', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2}
            ];

        status = GameStatus.FALL_ASLEEP_DOCTOR;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array), GameAction.nextGameStep(status));

        expect(state.round_data.healing).toBe(token_2);
        expect(state.prev_round_healing).toBe(token_2);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);
        expect(state.active_roles).toBeNull();
    });


    it('WAKE_UP_WHORE - просыпается путана, просто меняем статус', () => {

        status = GameStatus.WAKE_UP_WHORE;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
    });

    it('VOTE_WHORE - путана выбирает с кем переспать, должа измениться активная роль, и проавпдейтиться игроковое время', () => {

        status = GameStatus.VOTE_WHORE;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.active_roles).toEqual(GameStatusHelpers.getActiveRole(status));
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
    });

    it('VOTE_WHORE - путана решает с кем переспать, можно с всеми кроме самой себя, нет ограничений на спать с одним и тем же', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.WHORE}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        status = GameStatus.VOTE_WHORE;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.vote_variants.length).toBe(3);
        expect(state.votes.length).toBe(1);
    });

    it('FALL_ASLEEP_WHORE - после выбора, записываем пару путаны, чистим все по голосованию', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2}
            ];

        status = GameStatus.FALL_ASLEEP_WHORE;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array), GameAction.nextGameStep(status));

        expect(state.round_data.real_man).toBe(token_2);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);
        expect(state.active_roles).toBeNull();
    });



    it('WAKE_UP_COMMISSAR - просыпается коммиссар, просто меняем статус', () => {

        status = GameStatus.WAKE_UP_COMMISSAR;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
    });

    it('VOTE_COMMISSAR -  коммиссар получает массив со всеми остальными игроками, и может узнать является ли один из игроков мафией или нет, изменяется активная роль', () => {

        status = GameStatus.VOTE_COMMISSAR;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.active_roles).toEqual(GameStatusHelpers.getActiveRole(status));
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
    });

    it('VOTE_COMMISSAR - путана решает с кем переспать, можно с всеми кроме самой себя, нет ограничений на спать с одним и тем же', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.WHORE}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.COMMISSAR})
        ];

        status = GameStatus.VOTE_COMMISSAR;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.vote_variants.length).toBe(3);
        expect(state.votes.length).toBe(1);
    });

    it('FALL_ASLEEP_COMMISSAR - после ответа на свой вопрос, коммисар засыпает, ничего никуда не пишется, просто чистится инфа', () => {
        let token_1 = '23erefw',
            token_2 = 'dsasdv',
            vote_array: Array<VoteObject> = [
                {who_token: token_1, for_whom_token: token_2}
            ];

        status = GameStatus.FALL_ASLEEP_COMMISSAR;
        state =  GameStatusReducer(getGameStateAfterVote(vote_array), GameAction.nextGameStep(status));

        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.status).toEqual(status);
        expect(state.time_last_update_players).toBeLessThan(now);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);
        expect(state.active_roles).toBeNull();
    });

    describe('WAKE_UP_INHABITANT - город просыпается, в этот момент идет подсчет, убили ли кого, и если да то кого', () => {
        var token_1 = '23erefw',
            token_2 = 'dsasdv',
            token_3 = '43r34',
            token_4 = 'ewf4few',
            round_data: RoundData;
        
        beforeEach(() => {
            round_data = {
                mafia_target: token_2, // token игрока убитого ночь мафией
                healing: token_3, // token игрока которого лечил доктор
                real_man: token_4 // token игрока с которым переспала путана
            };
        });

        it('базовые апдейты состояния', () => {
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data), GameAction.nextGameStep(status));

            expect(state.status).toBe(status);
            expect(state.time_last_update).not.toBeLessThan(now);
            expect(state.time_last_update_players).not.toBeLessThan(now);
        });

        it('мафия стрела в одного, доктор хилил другого, путана легла с третьим', () => {
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data), GameAction.nextGameStep(status));

            expect(state.round_data.killed).toEqual([token_2]);
        });

        it('мафия стрела в одного, доктор хилил его же', () => {
            round_data.healing = token_2;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data), GameAction.nextGameStep(status));

            expect(state.round_data.killed.length).toBe(0);
        });


        it('мафия стрела в одного, доктор хилил другого, путана спала с целью мафии', () => {
            round_data.real_man = token_2;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data), GameAction.nextGameStep(status));

            expect(state.round_data.killed.length).toBe(0);
        });

        it('мафия стрела в одного, доктор хилил его же, путана спала с целью мафии', () => {
            round_data.real_man = token_2;
            round_data.healing = token_2;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data), GameAction.nextGameStep(status));

            expect(state.round_data.killed.length).toBe(0);
        });

        it('мафия стрела в путану, доктор хилил не путану и не цель, должны умереть оба', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.WHORE, token: token_1}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ];

            round_data.mafia_target = token_1;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

            expect(state.round_data.killed).toEqual([token_1, token_4]);
        });

        it('мафия стрела в путану, доктор хилил путану, умирает только ее клиент', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.WHORE, token: token_1}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ];

            round_data.mafia_target = token_1;
            round_data.healing = token_1;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

            expect(state.round_data.killed).toEqual([token_4]);
        });


        it('мафия стрела в путану, доктор хилил клиента, умирает только путана', () => {
            let players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.WHORE, token: token_1}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ];

            round_data.mafia_target = token_1;
            round_data.healing = token_4;
            status = GameStatus.WAKE_UP_INHABITANT;
            state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

            expect(state.round_data.killed).toEqual([token_1]);
        });
    });

    it('DAY_AFTER_NIGHT - после того как все проснулись и узнали кого убили, необходимо удалить этого игрока из партии, сменить статус', () => {
        let token_1 = 'wef43f',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ],
            round_data = {
                    killed: [token_1]
            };

        status = GameStatus.DAY_AFTER_NIGHT;
        state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.status).toEqual(status);
        expect(state.time_last_update_players).toBeLessThan(now);
        expect(_.findWhere(state.players, {token: token_1})).toBeUndefined();
    });

    it('DAY_AFTER_NIGHT - уберет двух игроков, если убили двоих сразу', () => {
        let token_1 = 'wef43f',
            token_2 = 'ewfew3',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.INHABITANT, token: token_2}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ],
            round_data = {
                killed: [token_1,token_2]
            };

        status = GameStatus.DAY_AFTER_NIGHT;
        state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

        expect(_.findWhere(state.players, {token: token_1})).toBeUndefined();
        expect(_.findWhere(state.players, {token: token_2})).toBeUndefined();
    });


    it('DAY_AFTER_NIGHT - не победителей игра продолжается', () => {
        let token_1 = 'wef43f',
            token_2 = 'ewfew3',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.INHABITANT, token: token_2}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ],
            round_data = {
                killed: [token_1,token_2]
            };

        status = GameStatus.DAY_AFTER_NIGHT;
        state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

        expect(state.win_role).toBeUndefined();
    });

    it('DAY_AFTER_NIGHT - победила мафия', () => {
        let token_1 = 'wef43f',
            token_2 = 'ewfew3',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.INHABITANT, token: token_2}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.DOCTOR})
            ],
            round_data = {
                killed: [token_1,token_2]
            };

        status = GameStatus.DAY_AFTER_NIGHT;
        state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

        expect(state.win_role).toBe(Roles.MAFIA);
    });

    it('DAY_AFTER_NIGHT - победила мафия', () => {
        let token_1 = 'wef43f',
            token_2 = 'ewfew3',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.INHABITANT})
            ],
            round_data = {
                killed: [token_1]
            };

        status = GameStatus.DAY_AFTER_NIGHT;
        state =  GameStatusReducer(getGameStateAfterNight(round_data, players), GameAction.nextGameStep(status));

        expect(state.win_role).toBe(Roles.MAFIA);
    });


    it('VOTE_INHABITANT - начинается голосование за то, кого казнить', () => {

        status = GameStatus.VOTE_INHABITANT;
        state =  GameStatusReducer(undefined, GameAction.nextGameStep(status));

        expect(state.status).toEqual(status);
        expect(state.active_roles).toEqual(GameStatusHelpers.getActiveRole(status));
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
    });


    it('VOTE_INHABITANT - все голосуют против всех', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.WHORE}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        status = GameStatus.VOTE_INHABITANT;
        state =  GameStatusReducer(getGameStateWithPlayers(players), GameAction.nextGameStep(status));

        expect(state.vote_variants.length).toBe(4);
        expect(state.votes.length).toBe(4);
    });
});