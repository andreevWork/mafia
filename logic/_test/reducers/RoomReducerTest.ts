import RoomReducer from '../../src/reducers/RoomReducer';
import {RoomState, InitialRoomState} from '../../src/entity/States';
import RoomStatus from '../../src/entity/RoomStatus';
import RoomAction from "../../src/actions/RoomAction";
import {Player} from "../../src/entity/Player";
import {getPlayer} from "../mocks/PlayersMocks";
import {MIN_PLAYERS} from "../../src/entity/GameEnvironment";


describe('RoomReducer', () => {
    let state: RoomState,
        now: number,
        player: Player;

    beforeEach(() => {
        now = Date.now();
    });

    it('initial state', () => {
        state = RoomReducer(undefined, {type: 'test_initial'});

        expect(state).toEqual(InitialRoomState);
    });

    it('create room', () => {
        state = RoomReducer(undefined, RoomAction.createRoom());

        // Время создания комнаты не может быть меньше, чем время перед запуском действия
        expect(state.time_create).not.toBeLessThan(now);
        expect(state.time_last_update).not.toBeLessThan(now);
        expect(state.status).toBe(RoomStatus.WAITING_PLAYERS);
        expect(state.players.length).toBe(0);
    });

    it('add players', () => {
        player = getPlayer('Bob');
        state = RoomReducer(undefined, RoomAction.addPlayer(player));

        expect(state.players.length).toEqual(1);
        expect(state.players[0]).toEqual(player);
        expect(state.time_last_update).not.toBeLessThan(now);

        player = getPlayer('Rob');
        now = Date.now();
        state = RoomReducer(state, {type: RoomAction.ADD_PLAYER, payload: player});

        expect(state.players.length).toEqual(2);
        expect(state.players[1]).toEqual(player);
        expect(state.time_last_update).not.toBeLessThan(now);
    });

    it('add players после добавления минимального числа игроков, флаг готовности становится true', () => {
        player = getPlayer('Bob');
        state = RoomReducer(undefined, RoomAction.addPlayer(player));

        expect(state.players.length).toEqual(1);
        expect(state.is_ready).toBeFalsy();

        player = getPlayer();
        state = RoomReducer(state, {type: RoomAction.ADD_PLAYER, payload: player});

        player = getPlayer();
        state = RoomReducer(state, {type: RoomAction.ADD_PLAYER, payload: player});

        player = getPlayer();
        state = RoomReducer(state, {type: RoomAction.ADD_PLAYER, payload: player});

        expect(state.is_ready).toBeFalsy();

        player = getPlayer();
        state = RoomReducer(state, {type: RoomAction.ADD_PLAYER, payload: player});

        expect(state.players.length).toEqual(MIN_PLAYERS);
        expect(state.is_ready).toBeTruthy();
    });

    it('start play', () => {
        state = RoomReducer(undefined, RoomAction.startPlay());

        expect(state.status).toBe(RoomStatus.PLAYING);
        expect(state.time_last_update).toBeLessThan(now);
        expect(state.time_last_update_players).toBeLessThan(now);
    });
});