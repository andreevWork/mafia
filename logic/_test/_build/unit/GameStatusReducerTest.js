/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var GameStatusReducer_1 = __webpack_require__(7);
	var GameStatus_1 = __webpack_require__(5);
	var GameAction_1 = __webpack_require__(4);
	var PlayersMocks_1 = __webpack_require__(11);
	var GameStateMocks_1 = __webpack_require__(12);
	var Roles_1 = __webpack_require__(6);
	var _ = __webpack_require__(3);
	describe('GameStatusReducer', function () {
	    var state, status, now;
	    beforeEach(function () {
	        now = Date.now();
	    });
	    it('DAY_BEFORE_NIGHT - наступает после голосования за казнь, необходимо подсчитать кого казнить, очистить данные по голосованию', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', token_3 = 'rwefe32', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 },
	            { who_token: token_2, for_whom_token: token_3 },
	            { who_token: token_3, for_whom_token: token_2 }
	        ];
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT })
	        ];
	        status = GameStatus_1.GameStatus.DAY_BEFORE_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array, undefined, players), GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	        expect(state.round_data.execution).toBe(token_2);
	        expect(state.vote_variants.length).toBe(0);
	        expect(state.votes.length).toBe(0);
	        expect(state.win_role).toBeUndefined();
	    });
	    it('DAY_BEFORE_NIGHT - если после казни число мафии и остальных ролей равно игра окончена, в пользу мафии', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', token_3 = 'rwefe32', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 },
	            { who_token: token_2, for_whom_token: token_3 },
	            { who_token: token_3, for_whom_token: token_2 }
	        ];
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_2 })
	        ];
	        status = GameStatus_1.GameStatus.DAY_BEFORE_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array, undefined, players), GameAction_1.default.nextGameStep(status));
	        expect(state.win_role).toEqual(Roles_1.default.MAFIA);
	    });
	    it('DAY_BEFORE_NIGHT - если после казни мафий не остается выигрывают мирные жители', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', token_3 = 'rwefe32', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 },
	            { who_token: token_2, for_whom_token: token_3 },
	            { who_token: token_3, for_whom_token: token_2 }
	        ];
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA, token: token_2 })
	        ];
	        status = GameStatus_1.GameStatus.DAY_BEFORE_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array, undefined, players), GameAction_1.default.nextGameStep(status));
	        expect(state.win_role).toEqual(Roles_1.default.INHABITANT);
	    });
	    it('FALL_ASLEEP_INHABITANT - город засыпает, очишается вся информации о преидущем дне, увеличть номер раунда на один', function () {
	        var players = PlayersMocks_1.getGamePlayerArray(5);
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_INHABITANT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(state.round_data).toBeNull();
	        expect(state.round_number).toBe(1);
	    });
	    it('FALL_ASLEEP_INHABITANT - город засыпает казненый игрок удаляется из массива с игроками', function () {
	        var token_1 = '2342', token_2 = 'erewre', players = [
	            PlayersMocks_1.getGamePlayer({ token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ token: token_2 }),
	            PlayersMocks_1.getGamePlayer({ token: token_2 })
	        ];
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_INHABITANT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayersAndExecution(players, token_1), GameAction_1.default.nextGameStep(status));
	        expect(_.findWhere(state.players, { token: token_1 })).toBeUndefined();
	    });
	    it('WAKE_UP_MAFIA - просыпается мафия, просто меняем статус', function () {
	        status = GameStatus_1.GameStatus.WAKE_UP_MAFIA;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	    });
	    it('VOTE_MAFIA - мафия голосует, должна появится активная роль мафия, проапдейтится время для апдейта игроков', function () {
	        status = GameStatus_1.GameStatus.VOTE_MAFIA;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.active_roles).toEqual(GameStatus_1.GameStatusHelpers.getActiveRole(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	    });
	    it('VOTE_MAFIA - мафия голосует, должен сформироваться массив из вариантов голосования и массив голосующих', function () {
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_MAFIA;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants.length).toBe(3);
	        expect(state.votes.length).toBe(1);
	    });
	    it('FALL_ASLEEP_MAFIA - после того как все проголосуют мафия засыпает, необходимо подсчитать кого убили, проапдейтить главное время, очистить данные по голосованию', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', token_3 = 'rwefe32', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 },
	            { who_token: token_2, for_whom_token: token_3 },
	            { who_token: token_3, for_whom_token: token_2 }
	        ];
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_MAFIA;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array), GameAction_1.default.nextGameStep(status));
	        expect(state.round_data.mafia_target).toBe(token_2);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(state.vote_variants.length).toBe(0);
	        expect(state.votes.length).toBe(0);
	        expect(state.active_roles).toBeNull();
	    });
	    it('WAKE_UP_DOCTOR - просыпается доктор, просто меняем статус', function () {
	        status = GameStatus_1.GameStatus.WAKE_UP_DOCTOR;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	    });
	    it('VOTE_DOCTOR - доктор выбирает кого будет лечить, должа измениться активная роль, и проавпдейтиться игроковое время', function () {
	        status = GameStatus_1.GameStatus.VOTE_DOCTOR;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.active_roles).toEqual(GameStatus_1.GameStatusHelpers.getActiveRole(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	    });
	    it('VOTE_DOCTOR - доктор выбирает кого лечить, массив вариантов - все живые игроки, т.к.  доктор может лечить сам себя, голосующий один доктор', function () {
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_DOCTOR;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants.length).toBe(4);
	        expect(state.votes.length).toBe(1);
	    });
	    it('VOTE_DOCTOR - доктор выбирает кого лечить, если второй и далее раунд, то нельзя исцелять одного игрока два раза подряд', function () {
	        var token_1 = '23erefw', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR, token: token_1 })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_DOCTOR;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayersAndPrevRoundHealing(players, token_1), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants).not.toContain(token_1);
	    });
	    it('FALL_ASLEEP_DOCTOR - после выбора кого хилить, пишем выбор в инфа пишется в объект раунда, чистится инфа по голосованию, также должно записаться кого похилил в специальное свойство prev_round_healing, для дальнейшего сравнения', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 }
	        ];
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_DOCTOR;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array), GameAction_1.default.nextGameStep(status));
	        expect(state.round_data.healing).toBe(token_2);
	        expect(state.prev_round_healing).toBe(token_2);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(state.vote_variants.length).toBe(0);
	        expect(state.votes.length).toBe(0);
	        expect(state.active_roles).toBeNull();
	    });
	    it('WAKE_UP_WHORE - просыпается путана, просто меняем статус', function () {
	        status = GameStatus_1.GameStatus.WAKE_UP_WHORE;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	    });
	    it('VOTE_WHORE - путана выбирает с кем переспать, должа измениться активная роль, и проавпдейтиться игроковое время', function () {
	        status = GameStatus_1.GameStatus.VOTE_WHORE;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.active_roles).toEqual(GameStatus_1.GameStatusHelpers.getActiveRole(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	    });
	    it('VOTE_WHORE - путана решает с кем переспать, можно с всеми кроме самой себя, нет ограничений на спать с одним и тем же', function () {
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_WHORE;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants.length).toBe(3);
	        expect(state.votes.length).toBe(1);
	    });
	    it('FALL_ASLEEP_WHORE - после выбора, записываем пару путаны, чистим все по голосованию', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 }
	        ];
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_WHORE;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array), GameAction_1.default.nextGameStep(status));
	        expect(state.round_data.real_man).toBe(token_2);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(state.vote_variants.length).toBe(0);
	        expect(state.votes.length).toBe(0);
	        expect(state.active_roles).toBeNull();
	    });
	    it('WAKE_UP_COMMISSAR - просыпается коммиссар, просто меняем статус', function () {
	        status = GameStatus_1.GameStatus.WAKE_UP_COMMISSAR;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).toBeLessThan(now);
	    });
	    it('VOTE_COMMISSAR -  коммиссар получает массив со всеми остальными игроками, и может узнать является ли один из игроков мафией или нет, изменяется активная роль', function () {
	        status = GameStatus_1.GameStatus.VOTE_COMMISSAR;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.active_roles).toEqual(GameStatus_1.GameStatusHelpers.getActiveRole(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	    });
	    it('VOTE_COMMISSAR - путана решает с кем переспать, можно с всеми кроме самой себя, нет ограничений на спать с одним и тем же', function () {
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.COMMISSAR })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_COMMISSAR;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants.length).toBe(3);
	        expect(state.votes.length).toBe(1);
	    });
	    it('FALL_ASLEEP_COMMISSAR - после ответа на свой вопрос, коммисар засыпает, ничего никуда не пишется, просто чистится инфа', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', vote_array = [
	            { who_token: token_1, for_whom_token: token_2 }
	        ];
	        status = GameStatus_1.GameStatus.FALL_ASLEEP_COMMISSAR;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterVote(vote_array), GameAction_1.default.nextGameStep(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(state.vote_variants.length).toBe(0);
	        expect(state.votes.length).toBe(0);
	        expect(state.active_roles).toBeNull();
	    });
	    describe('WAKE_UP_INHABITANT - город просыпается, в этот момент идет подсчет, убили ли кого, и если да то кого', function () {
	        var token_1 = '23erefw', token_2 = 'dsasdv', token_3 = '43r34', token_4 = 'ewf4few', round_data;
	        beforeEach(function () {
	            round_data = {
	                mafia_target: token_2,
	                healing: token_3,
	                real_man: token_4
	            };
	        });
	        it('базовые апдейты состояния', function () {
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data), GameAction_1.default.nextGameStep(status));
	            expect(state.status).toBe(status);
	            expect(state.time_last_update).not.toBeLessThan(now);
	            expect(state.time_last_update_players).not.toBeLessThan(now);
	        });
	        it('мафия стрела в одного, доктор хилил другого, путана легла с третьим', function () {
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed).toEqual([token_2]);
	        });
	        it('мафия стрела в одного, доктор хилил его же', function () {
	            round_data.healing = token_2;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed.length).toBe(0);
	        });
	        it('мафия стрела в одного, доктор хилил другого, путана спала с целью мафии', function () {
	            round_data.real_man = token_2;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed.length).toBe(0);
	        });
	        it('мафия стрела в одного, доктор хилил его же, путана спала с целью мафии', function () {
	            round_data.real_man = token_2;
	            round_data.healing = token_2;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed.length).toBe(0);
	        });
	        it('мафия стрела в путану, доктор хилил не путану и не цель, должны умереть оба', function () {
	            var players = [
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_4 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE, token: token_1 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	            ];
	            round_data.mafia_target = token_1;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed).toEqual([token_1, token_4]);
	        });
	        it('мафия стрела в путану, доктор хилил путану, умирает только ее клиент', function () {
	            var players = [
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_4 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE, token: token_1 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	            ];
	            round_data.mafia_target = token_1;
	            round_data.healing = token_1;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed).toEqual([token_4]);
	        });
	        it('мафия стрела в путану, доктор хилил клиента, умирает только путана', function () {
	            var players = [
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_4 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE, token: token_1 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	            ];
	            round_data.mafia_target = token_1;
	            round_data.healing = token_4;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed).toEqual([token_1]);
	        });
	        it('мафия стрела в путану, путана спала с кем то из мафий, тогда умирает только путана', function () {
	            var players = [
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE, token: token_1 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA, token: token_4 }),
	                PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	            ];
	            round_data.mafia_target = token_1;
	            status = GameStatus_1.GameStatus.WAKE_UP_INHABITANT;
	            state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	            expect(state.round_data.killed).toEqual([token_1]);
	        });
	    });
	    it('DAY_AFTER_NIGHT - после того как все проснулись и узнали кого убили, необходимо удалить этого игрока из партии, сменить статус', function () {
	        var token_1 = 'wef43f', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ], round_data = {
	            killed: [token_1]
	        };
	        status = GameStatus_1.GameStatus.DAY_AFTER_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.status).toEqual(status);
	        expect(state.time_last_update_players).toBeLessThan(now);
	        expect(_.findWhere(state.players, { token: token_1 })).toBeUndefined();
	    });
	    it('DAY_AFTER_NIGHT - уберет двух игроков, если убили двоих сразу', function () {
	        var token_1 = 'wef43f', token_2 = 'ewfew3', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_2 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ], round_data = {
	            killed: [token_1, token_2]
	        };
	        status = GameStatus_1.GameStatus.DAY_AFTER_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	        expect(_.findWhere(state.players, { token: token_1 })).toBeUndefined();
	        expect(_.findWhere(state.players, { token: token_2 })).toBeUndefined();
	    });
	    it('DAY_AFTER_NIGHT - не победителей игра продолжается', function () {
	        var token_1 = 'wef43f', token_2 = 'ewfew3', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_2 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ], round_data = {
	            killed: [token_1, token_2]
	        };
	        status = GameStatus_1.GameStatus.DAY_AFTER_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	        expect(state.win_role).toBeUndefined();
	    });
	    it('DAY_AFTER_NIGHT - победила мафия', function () {
	        var token_1 = 'wef43f', token_2 = 'ewfew3', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_2 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ], round_data = {
	            killed: [token_1, token_2]
	        };
	        status = GameStatus_1.GameStatus.DAY_AFTER_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	        expect(state.win_role).toBe(Roles_1.default.MAFIA);
	    });
	    it('DAY_AFTER_NIGHT - победила мафия', function () {
	        var token_1 = 'wef43f', token_2 = 'ewfew3', players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT, token: token_1 }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT })
	        ], round_data = {
	            killed: [token_1]
	        };
	        status = GameStatus_1.GameStatus.DAY_AFTER_NIGHT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateAfterNight(round_data, players), GameAction_1.default.nextGameStep(status));
	        expect(state.win_role).toBe(Roles_1.default.MAFIA);
	    });
	    it('VOTE_INHABITANT - начинается голосование за то, кого казнить', function () {
	        status = GameStatus_1.GameStatus.VOTE_INHABITANT;
	        state = GameStatusReducer_1.default(undefined, GameAction_1.default.nextGameStep(status));
	        expect(state.status).toEqual(status);
	        expect(state.active_roles).toEqual(GameStatus_1.GameStatusHelpers.getActiveRole(status));
	        expect(state.time_last_update).not.toBeLessThan(now);
	        expect(state.time_last_update_players).not.toBeLessThan(now);
	    });
	    it('VOTE_INHABITANT - все голосуют против всех', function () {
	        var players = [
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.INHABITANT }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.WHORE }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.MAFIA }),
	            PlayersMocks_1.getGamePlayer({ role: Roles_1.default.DOCTOR })
	        ];
	        status = GameStatus_1.GameStatus.VOTE_INHABITANT;
	        state = GameStatusReducer_1.default(GameStateMocks_1.getGameStateWithPlayers(players), GameAction_1.default.nextGameStep(status));
	        expect(state.vote_variants.length).toBe(4);
	        expect(state.votes.length).toBe(4);
	    });
	});


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(3);
	exports.InitialGameState = {
	    time_last_update: 0,
	    time_last_update_players: 0,
	    time_create: 0,
	    status: null,
	    players: [],
	    active_roles: null,
	    round_number: 0,
	    vote_variants: [],
	    votes: [],
	    round_data: null
	};
	exports.InitialRoomState = {
	    time_last_update: 0,
	    time_last_update_players: 0,
	    time_create: 0,
	    status: null,
	    players: [],
	    is_ready: false
	};
	function getNewState(old_state, time_keys, piece_of_new_state) {
	    var time_state = {};
	    time_keys.forEach(function (time_key) { time_state[time_key] = Date.now(); });
	    return _.extend({}, old_state, time_state, piece_of_new_state);
	}
	exports.getNewState = getNewState;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var GameAction;
	(function (GameAction) {
	    GameAction[GameAction["CREATE_GAME"] = 0] = "CREATE_GAME";
	    GameAction[GameAction["NEXT_GAME_STEP"] = 1] = "NEXT_GAME_STEP";
	    GameAction[GameAction["VOTE"] = 2] = "VOTE";
	})(GameAction || (GameAction = {}));
	var GameAction;
	(function (GameAction) {
	    function createGame(players) {
	        return {
	            type: GameAction.CREATE_GAME,
	            payload: { players: players }
	        };
	    }
	    GameAction.createGame = createGame;
	    function nextGameStep(status) {
	        return {
	            type: GameAction.NEXT_GAME_STEP,
	            payload: { status: status }
	        };
	    }
	    GameAction.nextGameStep = nextGameStep;
	    function vote(who_token, for_whom_token) {
	        return {
	            type: GameAction.VOTE,
	            payload: { who_token: who_token, for_whom_token: for_whom_token }
	        };
	    }
	    GameAction.vote = vote;
	})(GameAction || (GameAction = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameAction;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(6);
	var _ = __webpack_require__(3);
	(function (GameStatus) {
	    GameStatus[GameStatus["START_THE_GAME"] = 0] = "START_THE_GAME";
	    GameStatus[GameStatus["DAY_AFTER_NIGHT"] = 1] = "DAY_AFTER_NIGHT";
	    GameStatus[GameStatus["DAY_BEFORE_NIGHT"] = 2] = "DAY_BEFORE_NIGHT";
	    GameStatus[GameStatus["WAKE_UP_INHABITANT"] = 3] = "WAKE_UP_INHABITANT";
	    GameStatus[GameStatus["VOTE_INHABITANT"] = 4] = "VOTE_INHABITANT";
	    GameStatus[GameStatus["FALL_ASLEEP_INHABITANT"] = 5] = "FALL_ASLEEP_INHABITANT";
	    GameStatus[GameStatus["WAKE_UP_MAFIA"] = 6] = "WAKE_UP_MAFIA";
	    GameStatus[GameStatus["VOTE_MAFIA"] = 7] = "VOTE_MAFIA";
	    GameStatus[GameStatus["FALL_ASLEEP_MAFIA"] = 8] = "FALL_ASLEEP_MAFIA";
	    GameStatus[GameStatus["WAKE_UP_DOCTOR"] = 9] = "WAKE_UP_DOCTOR";
	    GameStatus[GameStatus["VOTE_DOCTOR"] = 10] = "VOTE_DOCTOR";
	    GameStatus[GameStatus["FALL_ASLEEP_DOCTOR"] = 11] = "FALL_ASLEEP_DOCTOR";
	    GameStatus[GameStatus["WAKE_UP_WHORE"] = 12] = "WAKE_UP_WHORE";
	    GameStatus[GameStatus["VOTE_WHORE"] = 13] = "VOTE_WHORE";
	    GameStatus[GameStatus["FALL_ASLEEP_WHORE"] = 14] = "FALL_ASLEEP_WHORE";
	    GameStatus[GameStatus["WAKE_UP_COMMISSAR"] = 15] = "WAKE_UP_COMMISSAR";
	    GameStatus[GameStatus["VOTE_COMMISSAR"] = 16] = "VOTE_COMMISSAR";
	    GameStatus[GameStatus["FALL_ASLEEP_COMMISSAR"] = 17] = "FALL_ASLEEP_COMMISSAR";
	})(exports.GameStatus || (exports.GameStatus = {}));
	var GameStatus = exports.GameStatus;
	var GameStatusHelpers;
	(function (GameStatusHelpers) {
	    function getActiveRole(game_status) {
	        switch (game_status) {
	            case GameStatus.VOTE_MAFIA:
	                return [Roles_1.default.MAFIA];
	            case GameStatus.VOTE_DOCTOR:
	                return [Roles_1.default.DOCTOR];
	            case GameStatus.VOTE_WHORE:
	                return [Roles_1.default.WHORE];
	            case GameStatus.VOTE_COMMISSAR:
	                return [Roles_1.default.COMMISSAR];
	            case GameStatus.VOTE_INHABITANT:
	                return [Roles_1.default.MAFIA, Roles_1.default.DOCTOR, Roles_1.default.INHABITANT, Roles_1.default.WHORE, Roles_1.default.COMMISSAR];
	            default:
	                return null;
	        }
	    }
	    GameStatusHelpers.getActiveRole = getActiveRole;
	    function getNextStatus(state) {
	        switch (state.status) {
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
	                if (_.findWhere(state.players, { role: Roles_1.default.DOCTOR })) {
	                    return GameStatus.WAKE_UP_DOCTOR;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.WHORE })) {
	                    return GameStatus.WAKE_UP_WHORE;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	            case GameStatus.FALL_ASLEEP_DOCTOR:
	                if (_.findWhere(state.players, { role: Roles_1.default.WHORE })) {
	                    return GameStatus.WAKE_UP_WHORE;
	                }
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	            case GameStatus.FALL_ASLEEP_WHORE:
	                if (_.findWhere(state.players, { role: Roles_1.default.COMMISSAR })) {
	                    return GameStatus.WAKE_UP_COMMISSAR;
	                }
	                return GameStatus.WAKE_UP_INHABITANT;
	        }
	    }
	    GameStatusHelpers.getNextStatus = getNextStatus;
	})(GameStatusHelpers = exports.GameStatusHelpers || (exports.GameStatusHelpers = {}));


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var Roles;
	(function (Roles) {
	    Roles[Roles["INHABITANT"] = 0] = "INHABITANT";
	    Roles[Roles["MAFIA"] = 1] = "MAFIA";
	    Roles[Roles["DOCTOR"] = 2] = "DOCTOR";
	    Roles[Roles["COMMISSAR"] = 3] = "COMMISSAR";
	    Roles[Roles["WHORE"] = 4] = "WHORE";
	})(Roles || (Roles = {}));
	exports.RolesMapping = {};
	exports.RolesMapping[Roles.INHABITANT] = {
	    title: 'Мирные жители',
	    description: 'Играют только “днем”, могут в это время суток, с помощью голосования, казнить одного из игроков. До конца игры не знают, кто из игроков за кого играет.',
	    card_img: 'inhabitant.png'
	};
	exports.RolesMapping[Roles.MAFIA] = {
	    title: 'Мафия',
	    description: 'Днем прикидываются мирными жителями, ночью просыпаются и убивают мирных жителей. Все Мафиози знают друг друга.',
	    card_img: 'mafia.png'
	};
	exports.RolesMapping[Roles.DOCTOR] = {
	    title: 'Доктор',
	    description: 'Играет за жителей. Игрок, получивший эту роль, может спасти ночью от смерти одного из игроков.',
	    card_img: 'doctor.png'
	};
	exports.RolesMapping[Roles.COMMISSAR] = {
	    title: 'Комиссар',
	    description: 'Играет за жителей. Просыпаясь ночью и выбрав одного игрока, он получает ответ на вопрос, является ли указанный человек мафиози.',
	    card_img: 'commissar.png'
	};
	exports.RolesMapping[Roles.WHORE] = {
	    title: 'Путана',
	    description: 'Играет за жителей. Ночью путана выбирает одного из игроков, которого она спасает от смерти. Отличие только в том, что если убивают доктора, то пациент остается жив. Если же представительница древнейшей профессии сама становится ночной жертвой мафии, то вместе с ней погибает и ее клиент.',
	    card_img: 'whore.png'
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Roles;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var States_1 = __webpack_require__(2);
	var GameStatus_1 = __webpack_require__(5);
	var Player_1 = __webpack_require__(8);
	var _ = __webpack_require__(3);
	var Roles_1 = __webpack_require__(6);
	var helpers_1 = __webpack_require__(10);
	function GameStatusReducer(state, action) {
	    if (state === void 0) { state = States_1.InitialGameState; }
	    var round_data = state.round_data || {};
	    var players = state.players;
	    var win_role;
	    switch (action.payload.status) {
	        case GameStatus_1.GameStatus.DAY_BEFORE_NIGHT:
	            var execution = '';
	            if (state.votes.length) {
	                execution = helpers_1.getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token'));
	            }
	            if (Player_1.Player.isEqualMafiaAndOthers(state.players, execution)) {
	                win_role = Roles_1.default.MAFIA;
	            }
	            if (!Player_1.Player.hasMafia(state.players, execution)) {
	                win_role = Roles_1.default.INHABITANT;
	            }
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                round_data: { execution: execution },
	                votes: [],
	                vote_variants: [],
	                win_role: win_role,
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.DAY_AFTER_NIGHT:
	            if (!_.isEmpty(round_data.killed)) {
	                players = players.filter(function (player) { return !~round_data.killed.indexOf(player.token); });
	            }
	            if (Player_1.Player.isEqualMafiaAndOthers(players)) {
	                win_role = Roles_1.default.MAFIA;
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                players: players,
	                win_role: win_role
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_INHABITANT:
	            if (state.round_data && state.round_data.execution) {
	                players = players.filter(function (player) { return player.token !== state.round_data.execution; });
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                round_data: null,
	                players: players,
	                round_number: ++state.round_number
	            });
	        case GameStatus_1.GameStatus.WAKE_UP_INHABITANT:
	            round_data = _.clone(state.round_data);
	            round_data.killed = [];
	            round_data.killed = round_data.killed.concat(round_data.mafia_target);
	            var whore = _.findWhere(state.players, { role: Roles_1.default.WHORE });
	            if (whore && whore.token === round_data.mafia_target && _.findWhere(state.players, { token: round_data.real_man }).role !== Roles_1.default.MAFIA) {
	                round_data.killed = round_data.killed.concat(round_data.real_man);
	            }
	            if (round_data.mafia_target === round_data.real_man) {
	                round_data.killed = [];
	            }
	            if (~round_data.killed.indexOf(round_data.healing)) {
	                round_data.killed = _.without(round_data.killed, round_data.healing);
	            }
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                round_data: round_data
	            });
	        case GameStatus_1.GameStatus.VOTE_COMMISSAR:
	        case GameStatus_1.GameStatus.VOTE_MAFIA:
	        case GameStatus_1.GameStatus.VOTE_INHABITANT:
	        case GameStatus_1.GameStatus.VOTE_DOCTOR:
	        case GameStatus_1.GameStatus.VOTE_WHORE:
	            var active_roles_1 = GameStatus_1.GameStatusHelpers.getActiveRole(action.payload.status), vote_variants = state.players
	                .filter(function (player) {
	                if (GameStatus_1.GameStatus.VOTE_DOCTOR === action.payload.status) {
	                    return state.prev_round_healing ? state.prev_round_healing !== player.token : true;
	                }
	                if (GameStatus_1.GameStatus.VOTE_INHABITANT === action.payload.status) {
	                    return true;
	                }
	                return !~active_roles_1.indexOf(player.role);
	            })
	                .map(function (player) { return player.token; }), votes = state.players
	                .filter(function (player) { return !!~active_roles_1.indexOf(player.role); })
	                .map(function (player) { return ({ who_token: player.token }); });
	            return States_1.getNewState(state, ['time_last_update', 'time_last_update_players'], {
	                status: action.payload.status,
	                active_roles: active_roles_1,
	                vote_variants: vote_variants,
	                votes: votes
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_MAFIA:
	        case GameStatus_1.GameStatus.FALL_ASLEEP_DOCTOR:
	        case GameStatus_1.GameStatus.FALL_ASLEEP_WHORE:
	            var vote_result = helpers_1.getMaxRepeatValue(_.pluck(state.votes, 'for_whom_token')), prev_round_healing = void 0;
	            switch (action.payload.status) {
	                case GameStatus_1.GameStatus.FALL_ASLEEP_DOCTOR:
	                    round_data.healing = prev_round_healing = vote_result;
	                    break;
	                case GameStatus_1.GameStatus.FALL_ASLEEP_MAFIA:
	                    round_data.mafia_target = vote_result;
	                    break;
	                case GameStatus_1.GameStatus.FALL_ASLEEP_WHORE:
	                    round_data.real_man = vote_result;
	                    break;
	            }
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                round_data: round_data,
	                prev_round_healing: prev_round_healing,
	                votes: [],
	                vote_variants: [],
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.FALL_ASLEEP_COMMISSAR:
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status,
	                votes: [],
	                vote_variants: [],
	                active_roles: null
	            });
	        case GameStatus_1.GameStatus.WAKE_UP_MAFIA:
	        case GameStatus_1.GameStatus.WAKE_UP_DOCTOR:
	        case GameStatus_1.GameStatus.WAKE_UP_WHORE:
	        case GameStatus_1.GameStatus.WAKE_UP_COMMISSAR:
	            return States_1.getNewState(state, ['time_last_update'], {
	                status: action.payload.status
	            });
	        default:
	            return state;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameStatusReducer;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(6);
	var _ = __webpack_require__(3);
	var GameEnvironment_1 = __webpack_require__(9);
	var Player;
	(function (Player) {
	    Player.Avatars = {
	        path: '/public/img/avatars/',
	        variants: [
	            'lady.png',
	            'black.png'
	        ]
	    };
	    function RolesForPlayers(players) {
	        var steps = Math.floor((players.length - GameEnvironment_1.MIN_PLAYERS) / GameEnvironment_1.STEP_CHANGE_ROLES) + 1, game_players = _.shuffle(players).map(function (player) { return _.extend({ role: Roles_1.default.INHABITANT }, player); }), flag_commissar = false, index = 0;
	        game_players[index++].role = Roles_1.default.DOCTOR;
	        game_players[index++].role = Roles_1.default.WHORE;
	        while (steps--) {
	            game_players[index++].role = Roles_1.default.MAFIA;
	            if (steps % 2 !== 0) {
	                if (!flag_commissar) {
	                    game_players[index++].role = Roles_1.default.COMMISSAR;
	                    flag_commissar = true;
	                }
	            }
	        }
	        return game_players;
	    }
	    Player.RolesForPlayers = RolesForPlayers;
	    function isEqualMafiaAndOthers(players, remove_in_future_token) {
	        if (players === void 0) { players = []; }
	        var mafia_count = 0, others_count = 0;
	        players.forEach(function (player) {
	            if (remove_in_future_token === player.token)
	                return;
	            if (player.role === Roles_1.default.MAFIA) {
	                mafia_count++;
	            }
	            else {
	                others_count++;
	            }
	        });
	        return players.length && mafia_count === others_count;
	    }
	    Player.isEqualMafiaAndOthers = isEqualMafiaAndOthers;
	    function hasMafia(players, remove_in_future_token) {
	        if (players === void 0) { players = []; }
	        var mafia_count = 0;
	        players.forEach(function (player) {
	            if (remove_in_future_token === player.token)
	                return;
	            if (player.role === Roles_1.default.MAFIA) {
	                mafia_count++;
	            }
	        });
	        return players.length && !!mafia_count;
	    }
	    Player.hasMafia = hasMafia;
	})(Player = exports.Player || (exports.Player = {}));


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	exports.MIN_PLAYERS = 5;
	exports.STEP_CHANGE_ROLES = 2;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(3);
	function getMaxRepeatValue(arr) {
	    var obj = {
	        max: {
	            count: 0,
	            value: ''
	        }
	    };
	    _.shuffle(arr).forEach(function (val) {
	        obj[val] = obj[val] || 0;
	        obj[val]++;
	        if (obj[val] > obj.max.count) {
	            obj.max.count = obj[val];
	            obj.max.value = val;
	        }
	    });
	    return obj.max.value;
	}
	exports.getMaxRepeatValue = getMaxRepeatValue;
	function getRandomString(len) {
	    var str = '123456789qwertyuiopasdfghjklzxcvbnm', arr_symbols = str.split(''), random_str = '';
	    while (len--) {
	        random_str += arr_symbols[Math.floor(Math.random() * str.length)];
	    }
	    return random_str;
	}
	exports.getRandomString = getRandomString;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(6);
	exports.INITIAL_NAME = 'Bob';
	exports.INITIAL_AVATAR = '/avatar.png';
	exports.INITIAL_TOKEN = 'a257dc9';
	function getPlayer(_a) {
	    var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? exports.INITIAL_NAME : _c, _d = _b.avatar, avatar = _d === void 0 ? exports.INITIAL_AVATAR : _d, _e = _b.token, token = _e === void 0 ? exports.INITIAL_TOKEN : _e;
	    return { name: name, avatar: avatar, token: token };
	}
	exports.getPlayer = getPlayer;
	function getGamePlayer(_a) {
	    var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? exports.INITIAL_NAME : _c, _d = _b.avatar, avatar = _d === void 0 ? exports.INITIAL_AVATAR : _d, _e = _b.token, token = _e === void 0 ? exports.INITIAL_TOKEN : _e, _f = _b.role, role = _f === void 0 ? Roles_1.default.INHABITANT : _f;
	    return { name: name, avatar: avatar, token: token, role: role };
	}
	exports.getGamePlayer = getGamePlayer;
	function getGamePlayerArray(len) {
	    return Array.apply(null, { length: len }).map(function () { return getGamePlayer(); });
	}
	exports.getGamePlayerArray = getGamePlayerArray;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var States_1 = __webpack_require__(2);
	var PlayersMocks_1 = __webpack_require__(11);
	function getGameStateAfterVote(votes_array, vote_variants, players_array) {
	    if (vote_variants === void 0) { vote_variants = ['23434', '32432', 'r43et43']; }
	    return States_1.getNewState(States_1.InitialGameState, [], { votes: votes_array, vote_variants: vote_variants, players: players_array });
	}
	exports.getGameStateAfterVote = getGameStateAfterVote;
	function getGameStateWithPlayers(players_array) {
	    return States_1.getNewState(States_1.InitialGameState, [], { players: players_array });
	}
	exports.getGameStateWithPlayers = getGameStateWithPlayers;
	function getGameStateWithPlayersAndExecution(players_array, execution) {
	    return States_1.getNewState(States_1.InitialGameState, [], { players: players_array, round_data: { execution: execution } });
	}
	exports.getGameStateWithPlayersAndExecution = getGameStateWithPlayersAndExecution;
	function getGameStateWithPlayersAndPrevRoundHealing(players_array, prev_round_healing) {
	    return States_1.getNewState(States_1.InitialGameState, [], { players: players_array, prev_round_healing: prev_round_healing });
	}
	exports.getGameStateWithPlayersAndPrevRoundHealing = getGameStateWithPlayersAndPrevRoundHealing;
	function getGameStateAfterNight(round_data, players) {
	    if (players === void 0) { players = [PlayersMocks_1.getGamePlayer(), PlayersMocks_1.getGamePlayer()]; }
	    return States_1.getNewState(States_1.InitialGameState, [], { round_data: round_data, players: players });
	}
	exports.getGameStateAfterNight = getGameStateAfterNight;


/***/ }
/******/ ]);