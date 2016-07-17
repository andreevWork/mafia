/*
  ********************
  *
  *
  *  Первый сценарий для теста игры:
  *     Всего 6 игроков, что на один больше минимального числа.
  *
  *  За этот тест, будут проверены следующие кейсы, по раундам:
  *     1 ночь: Мафия стреляет в жителя, житель умирает
  *     1 день: Выгоняют мирного жителя
  *     2 ночь: Мафия стреляет в жителя, его лечит доктор, никто не умирает
  *     2 день: Выгоняют доктора
  *     3 ночь: Стреляют в клиента путаны никто не умирает
  *     3 день: Выгоняют путану, мафия побеждает
  *
  *  Игра запускается и идет как в продакшене, только на каждый шаг игры будет написано ПОЛНОЕ ожидаемое состояние мира игры.
 */

import { createStore } from 'redux';
import GameReducer from "../../src/reducers/GameReducer";
import {IStore} from "~redux/redux";
import {GameState, InitialGameState} from "../../src/entity/States";
import {GameStatus, GameStatusHelpers} from "../../src/entity/GameStatus";
import GameAction from "../../src/actions/GameAction";
import {Player, GamePlayer} from "../../src/entity/Player";
import {getPlayer} from "../mocks/PlayersMocks";
import * as _ from 'underscore';
import Roles from "../../src/entity/Roles";

let store: IStore<GameState> = createStore(GameReducer),
    name_1 = 'Bob', token_1 = '23rfew4',
    name_2 = 'Bill', token_2 = 'r32fewa',
    name_3 = 'Rob', token_3 = 'asdf4332',
    name_4 = 'Ron', token_4 = 'asdf43wf4',
    name_5 = 'Maria', token_5 = 'sadfq4wt4',
    name_6 = 'Jessica', token_6 = 'asdf43f',
    players: Array<Player> = [
        getPlayer({name: name_1, token: token_1}),
        getPlayer({name: name_2, token: token_2}),
        getPlayer({name: name_3, token: token_3}),
        getPlayer({name: name_4, token: token_4}),
        getPlayer({name: name_5, token: token_5}),
        getPlayer({name: name_6, token: token_6})
    ],
    mafia_target, mafia, doctor, whore, healing, real_man;

describe('Первый сценарий для теста игрового редьюсера', () => {
    // Состояние в которое будет писаться, то что ожидается от игрового мира
    let reference_state: GameState;


    it('Проверка что хранилище создалось с начальным объектом', () => {
        reference_state = InitialGameState;
        
        expect(store.getState()).toEqual(reference_state);
    });

    it('Создаем игровой мир', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.START_THE_GAME);

            let count = _.countBy(store.getState().players, player => {
                return player.role;
            });

            expect(count[Roles.INHABITANT]).toBe(3);
            expect(count[Roles.DOCTOR]).toBe(1);
            expect(count[Roles.WHORE]).toBe(1);
            expect(count[Roles.MAFIA]).toBe(1);
            
            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        // Начинаем игру, при этом генерируем роли для игроков
        store.dispatch(GameAction.createGame(Player.RolesForPlayers(players)));
    });

    it('1 ночь начинается', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_INHABITANT);
            expect(store.getState().round_number).toBe(1);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь просыпается мафия', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_MAFIA);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь начинается голосование мафии', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual(_.pluck(store.getState().players.filter(player => player.role === Roles.MAFIA), 'token').map(token => ({who_token: token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь приходит голос от мафии', (done) => {
        let unsubscribe;

        mafia = _.findWhere(store.getState().players, {role: Roles.MAFIA}).token;

        mafia_target = _.findWhere(store.getState().players, {role: Roles.INHABITANT}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual([{who_token: mafia, for_whom_token: mafia_target}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            mafia,
            mafia_target
        ));
    });

    it('1 ночь после всех голосов мафии, мафия засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_MAFIA);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).toEqual(mafia_target);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь после мафии встает доктор', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_DOCTOR);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь доктор начинает выбор', (done) => {
        let unsubscribe;

        doctor = _.findWhere(store.getState().players, {role: Roles.DOCTOR}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_DOCTOR);
            expect(store.getState().active_roles).toEqual([Roles.DOCTOR]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players, 'token'));
            expect(store.getState().votes).toEqual([{who_token: doctor}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь доктор проголосует и не сможет спасти убитого', (done) => {
        let unsubscribe;

        healing = _.first(_.without(_.pluck(_.where(store.getState().players, {role: Roles.INHABITANT}), 'token'), mafia_target));

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_DOCTOR);
            expect(store.getState().active_roles).toEqual([Roles.DOCTOR]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players, 'token'));
            expect(store.getState().votes).toEqual([{who_token: doctor, for_whom_token: healing}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            doctor,
            healing
        ));
    });

    it('1 ночь после выбора доктор засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_DOCTOR);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).not.toEqual(store.getState().round_data.healing);
            expect(store.getState().round_data.healing).toEqual(healing);
            expect(store.getState().prev_round_healing).toEqual(healing);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь после доктора встает путана', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_WHORE);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь путана начинает голосование', (done) => {
        let unsubscribe;

        whore = _.findWhere(store.getState().players, {role: Roles.WHORE}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore}]);
            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });


    it('1 ночь путана проголосует и не сможет спасти убитого', (done) => {
        let unsubscribe;

        real_man = _.last(_.without(_.pluck(_.where(store.getState().players, {role: Roles.INHABITANT}), 'token'), mafia_target));

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore, for_whom_token: real_man}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            whore,
            real_man
        ));
    });

    it('1 ночь после выбора путана засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_WHORE);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).not.toEqual(store.getState().round_data.real_man);
            expect(store.getState().round_data.real_man).toEqual(real_man);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 ночь коммиссара нет, следовательно после путаны город просыпается, и находят убитого', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_INHABITANT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.killed).toEqual([mafia_target]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 день после выяснения кого убили, наступет первая половина дня в которую идет обсуждение за мафию, причем убитый игрок уже будет удален из игроков в партии', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_AFTER_NIGHT);
            expect(store.getState().players.length).toBe(5);
            expect(_.findWhere(store.getState().players, {token: mafia_target})).toBeUndefined();

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 день начианется голосование за мафию', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
            expect(store.getState().active_roles).toEqual(GameStatusHelpers.getActiveRole(store.getState().status));
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players, 'token'));
            expect(store.getState().votes).toEqual(store.getState().players.map(p => ({who_token: p.token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('1 день люди голосуют за мафию и выгонят мирного жителя например того, кого хилил доктор ночью', () => {
        let execution = healing;

        store.getState().players.forEach((player: GamePlayer) => {
            store.dispatch(GameAction.vote(
                player.token,
                execution
            ));
        });

        // Поскольку голосование точно синхронно сделаем для простоты так
        expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
        expect(store.getState().votes).toEqual(store.getState().players.map(p => ({who_token: p.token, for_whom_token: execution})));

    });

    it('1 день все проголосовали, объявляются результаты  и натсупает вторая половина дня', (done) => {
        let unsubscribe;
        let execution = healing;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_BEFORE_NIGHT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().win_role).toBeUndefined();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.execution).toEqual(execution);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь начинается, казненный игрок удаляется из массива', (done) => {
        let unsubscribe;
        let execution = healing;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_INHABITANT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().round_data).toBeNull();
            expect(store.getState().players.length).toEqual(4);
            expect(store.getState().round_number).toEqual(2);
            expect(_.findWhere(store.getState().players, {token: execution})).toBeUndefined();

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь просыпается мафия', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_MAFIA);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь начинается голосование мафии', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual(_.pluck(store.getState().players.filter(player => player.role === Roles.MAFIA), 'token').map(token => ({who_token: token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь приходит голос от мафии', (done) => {
        let unsubscribe;

        mafia_target = _.findWhere(store.getState().players, {role: Roles.INHABITANT}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual([{who_token: mafia, for_whom_token: mafia_target}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            mafia,
            mafia_target
        ));
    });

    it('2 ночь после всех голосов мафии, мафия засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_MAFIA);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).toEqual(mafia_target);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь после мафии встает доктор', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_DOCTOR);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь доктор начинает выбор, причем тот за кого он голосовал в том раунде в выборе отстутствует', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_DOCTOR);
            expect(store.getState().active_roles).toEqual([Roles.DOCTOR]);
            expect(store.getState().vote_variants).toEqual(_.without(_.pluck(store.getState().players, 'token'), store.getState().prev_round_healing));
            expect(store.getState().votes).toEqual([{who_token: doctor}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь доктор проголосует и спасает убитого', (done) => {
        let unsubscribe;

        healing = mafia_target;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_DOCTOR);
            expect(store.getState().active_roles).toEqual([Roles.DOCTOR]);
            expect(store.getState().vote_variants).toEqual(_.without(_.pluck(store.getState().players, 'token'), store.getState().prev_round_healing));
            expect(store.getState().votes).toEqual([{who_token: doctor, for_whom_token: healing}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            doctor,
            healing
        ));
    });

    it('2 ночь после выбора доктор засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_DOCTOR);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).toEqual(store.getState().round_data.healing);
            expect(store.getState().round_data.healing).toEqual(healing);
            expect(store.getState().prev_round_healing).toEqual(healing);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь после доктора встает путана', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_WHORE);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь путана начинает голосование', (done) => {
        let unsubscribe;

        whore = _.findWhere(store.getState().players, {role: Roles.WHORE}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore}]);
            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });


    it('2 ночь путана проголосует и это уже не имеет значения', (done) => {
        let unsubscribe;

        real_man = _.last(_.without(_.pluck(_.where(store.getState().players, {role: Roles.INHABITANT}), 'token'), mafia_target));

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore, for_whom_token: real_man}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            whore,
            real_man
        ));
    });

    it('2 ночь после выбора путана засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_WHORE);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).not.toEqual(store.getState().round_data.real_man);
            expect(store.getState().round_data.healing).not.toEqual(store.getState().round_data.real_man);
            expect(store.getState().round_data.real_man).toEqual(real_man);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 ночь коммиссара нет, следовательно после путаны город просыпается, и никого не найдут', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_INHABITANT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.killed).toEqual([]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 день никого не убили, никто не удаляется', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_AFTER_NIGHT);
            expect(store.getState().players.length).toBe(4);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 день начианется голосование за мафию', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
            expect(store.getState().active_roles).toEqual(GameStatusHelpers.getActiveRole(store.getState().status));
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players, 'token'));
            expect(store.getState().votes).toEqual(store.getState().players.map(p => ({who_token: p.token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('2 день люди голосуют за мафию и выгонят доктора', () => {

        store.getState().players.forEach((player: GamePlayer, i) => {
            let for_whom_token = i % 3 === 0 && i !== 0 ? healing : doctor;

            store.dispatch(GameAction.vote(
                player.token,
                for_whom_token
            ));
        });

        // Поскольку голосование точно синхронно сделаем для простоты так
        expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
        expect(store.getState().votes).toEqual(store.getState().players.map((p, i) => {
            let for_whom_token = i % 3 === 0 && i !== 0 ? healing : doctor;

            return {who_token: p.token, for_whom_token: for_whom_token}
        }));

    });

    it('2 день все проголосовали, объявляются результаты  и натсупает вторая половина дня', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_BEFORE_NIGHT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().win_role).toBeUndefined();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.execution).toEqual(doctor);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь начинается, казненный игрок удаляется из массива', (done) => {
        let unsubscribe;
        let execution = healing;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_INHABITANT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().round_data).toBeNull();
            expect(store.getState().players.length).toEqual(3);
            expect(store.getState().round_number).toEqual(3);
            expect(_.findWhere(store.getState().players, {token: doctor})).toBeUndefined();

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь просыпается мафия', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_MAFIA);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь начинается голосование мафии', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual(_.pluck(store.getState().players.filter(player => player.role === Roles.MAFIA), 'token').map(token => ({who_token: token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь приходит голос от мафии', (done) => {
        let unsubscribe;

        mafia_target = _.findWhere(store.getState().players, {role: Roles.INHABITANT}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_MAFIA);
            expect(store.getState().active_roles).toEqual([Roles.MAFIA]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.role !== Roles.MAFIA), 'token'));
            expect(store.getState().votes).toEqual([{who_token: mafia, for_whom_token: mafia_target}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            mafia,
            mafia_target
        ));
    });

    it('3 ночь после всех голосов мафии, мафия засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_MAFIA);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).toEqual(mafia_target);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь после мафии встает путана, доктор убит', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_WHORE);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь путана начинает голосование', (done) => {
        let unsubscribe;

        whore = _.findWhere(store.getState().players, {role: Roles.WHORE}).token;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore}]);
            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });


    it('3 ночь путана проголосует и спасает жителя', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_WHORE);
            expect(store.getState().active_roles).toEqual([Roles.WHORE]);
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players.filter(player => player.token !== whore), 'token'));
            expect(store.getState().votes).toEqual([{who_token: whore, for_whom_token: mafia_target}]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.vote(
            whore,
            mafia_target
        ));
    });

    it('3 ночь после выбора путана засыпает', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.FALL_ASLEEP_WHORE);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.mafia_target).toEqual(store.getState().round_data.real_man);
            expect(store.getState().round_data.real_man).toEqual(mafia_target);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 ночь коммиссара нет, следовательно после путаны город просыпается, и никого не найдут', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.WAKE_UP_INHABITANT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.killed).toEqual([]);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 день никого не убили, никто не удаляется', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_AFTER_NIGHT);
            expect(store.getState().players.length).toBe(3);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 день начианется голосование за мафию', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
            expect(store.getState().active_roles).toEqual(GameStatusHelpers.getActiveRole(store.getState().status));
            expect(store.getState().vote_variants).toEqual(_.pluck(store.getState().players, 'token'));
            expect(store.getState().votes).toEqual(store.getState().players.map(p => ({who_token: p.token})));

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

    it('3 день люди голосуют за мафию и выгонят путану', () => {

        store.getState().players.forEach((player: GamePlayer, i) => {
            let for_whom_token = i % 3 === 0 && i !== 0 ? healing : whore;

            store.dispatch(GameAction.vote(
                player.token,
                for_whom_token
            ));
        });

        // Поскольку голосование точно синхронно сделаем для простоты так
        expect(store.getState().status).toBe(GameStatus.VOTE_INHABITANT);
        expect(store.getState().votes).toEqual(store.getState().players.map((p, i) => {
            let for_whom_token = i % 3 === 0 && i !== 0 ? healing : whore;

            return {who_token: p.token, for_whom_token: for_whom_token}
        }));

    });

    it('2 день все проголосовали, объявляются результаты убивают путану и в результате остается только житель и мафия, а следовательно мафия выйграла', (done) => {
        let unsubscribe;

        unsubscribe = store.subscribe(() => {
            expect(store.getState().status).toBe(GameStatus.DAY_BEFORE_NIGHT);
            expect(store.getState().active_roles).toBeNull();
            expect(store.getState().win_role).toBe(Roles.MAFIA);
            expect(store.getState().vote_variants.length).toEqual(0);
            expect(store.getState().votes.length).toEqual(0);
            expect(store.getState().round_data.execution).toEqual(whore);

            // Отписываемся т. к. store общий для всех тестов
            unsubscribe();
            done();
        });

        store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(store.getState())));
    });

});
