import GameReducer from '../../src/reducers/GameReducer';
import {GameState, InitialGameState} from '../../src/entity/States';
import {GameStatusHelpers, GameStatus} from '../../src/entity/GameStatus';
import GameAction from "../../src/actions/GameAction";
import {Player, GamePlayer} from "../../src/entity/Player";
import {getGamePlayerArray, getGamePlayer, INITIAL_TOKEN} from "../mocks/PlayersMocks";
import Roles from "../../src/entity/Roles";
import * as _ from 'underscore';
import {getGameStateAfterVote} from "../mocks/GameStateMocks";


describe('GameReducer', () => {
    let state: GameState<GameStatus>,
        now: number;

    beforeEach(() => {
        now = Date.now();
    });

    it('initial state', () => {
        state =  GameReducer(undefined, {type: 'test_initial'});

        expect(state).toEqual(InitialGameState);
    });

    it('create game', () => {
        let len: number = 8;
        state =  GameReducer(undefined, GameAction.createGame(getGamePlayerArray(len)));

        expect(state.status).toEqual(GameStatus.START_THE_GAME);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
        expect(state.players.length).toBe(len);
        expect(state.time_create).not.toBeLessThan(now);
    });

    it('vote', () => {
        let for_whom_token = ' wedf443',
            another_token = 'dsf43f';

        state =  GameReducer(getGameStateAfterVote([{who_token: another_token}, {who_token: INITIAL_TOKEN}]), GameAction.vote(
            INITIAL_TOKEN,
            for_whom_token
        ));
        expect(_.findWhere(state.votes, {who_token: another_token}).for_whom_token).toBeUndefined();
        expect(_.findWhere(state.votes, {who_token: INITIAL_TOKEN}).for_whom_token).toBe(for_whom_token);
    });

    it('голосовать можно только раз', () => {
        let for_whom_token = ' wedf443',
            another_token = 'dsf43f';

        state =  GameReducer(_.extend({}, InitialGameState, {votes: [{who_token: another_token}, {who_token: INITIAL_TOKEN}]}), GameAction.vote(
            INITIAL_TOKEN,
            for_whom_token
        ));
        
        // Голосуем тем же игроком но уже за другого, не должно сработать, голосвать можно только раз
        state =  GameReducer(state, GameAction.vote(
            INITIAL_TOKEN,
            another_token
        ));

        expect(_.findWhere(state.votes, {who_token: another_token}).for_whom_token).toBeUndefined();
        expect(_.findWhere(state.votes, {who_token: INITIAL_TOKEN}).for_whom_token).toBe(for_whom_token);
    });
});