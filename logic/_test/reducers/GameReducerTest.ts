import GameReducer, {InitialGameState} from '../../src/reducers/GameReducer';
import {GameState} from '../../src/entity/States';
import {GameStatusHelpers, GameStatus} from '../../src/entity/GameStatus';
import GameAction from "../../src/actions/GameAction";
import {Player, GamePlayer} from "../../src/entity/Player";
import {getGamePlayerArray, getGamePlayer, INITIAL_TOKEN} from "../mocks/PlayersMocks";
import Roles from "../../src/entity/Roles";
import * as _ from 'underscore';


describe('RoomReducer', () => {
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

        expect(state.status).toEqual(GameStatus['DAY_BEFORE_NIGHT']);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
        expect(state.players.length).toBe(len);
        expect(state.time_create).not.toBeLessThan(now);
    });

    it('next game step', () => {
        state =  GameReducer(undefined, GameAction.nextGameStep(GameStatus['WAKE_UP_COMMISSAR']));

        expect(state.status).toEqual(GameStatus['WAKE_UP_COMMISSAR']);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeGreaterThan(now);
        expect(state.vote_variants.length).toBe(0);
        expect(state.votes.length).toBe(0);

        now = Date.now();
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.COMMISSAR}),
            getGamePlayer({role: Roles.DOCTOR}),
            getGamePlayer({role: Roles.INHABITANT})
        ];

        state =  GameReducer(_.extend({}, InitialGameState, {players}), GameAction.nextGameStep(GameStatus['VOTE_COMMISSAR']));

        expect(state.status).toEqual(GameStatus['VOTE_COMMISSAR']);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.time_last_update_players).not.toBeLessThan(now);
        expect(state.vote_variants.length).toBe(4);
        expect(state.vote_variants[0].role).toBeUndefined();
        expect(state.votes.length).toBe(1);
    });

    it('vote', () => {
        let for_whom_token = ' wedf443';

        state =  GameReducer(_.extend({}, InitialGameState, {votes: [{who_token: '21er3'}, {who_token: INITIAL_TOKEN}]}), GameAction.vote(
            INITIAL_TOKEN,
            for_whom_token
        ));

        expect(state.votes).toBeLessThan(now);
    });

});