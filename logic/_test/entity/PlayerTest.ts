import {Player, GamePlayer} from "../../src/entity/Player";
import {getPlayer, getGamePlayer} from "../mocks/PlayersMocks";
import * as _ from 'underscore';
import Roles from "../../src/entity/Roles";
import {MIN_PLAYERS, STEP_CHANGE_ROLES} from '../../src/entity/GameEnvironment';

let isEqualMafiaAndOthers = Player.isEqualMafiaAndOthers,
    hasMafia = Player.hasMafia;


describe('RolesForPlayers', () => {
    let players: Array<Player>,
        game_players: Array<GamePlayer>,
        roles_array: Array<Roles>,
        count_roles: _.Dictionary<number>,
        mafia_count: number,
        doctor_count: number,
        whore_count: number,
        commissar_count: number;

    let arr: Array<number> = [
        MIN_PLAYERS,
        MIN_PLAYERS + 1,
        MIN_PLAYERS + STEP_CHANGE_ROLES,
        MIN_PLAYERS + STEP_CHANGE_ROLES + 1,
        MIN_PLAYERS + STEP_CHANGE_ROLES + STEP_CHANGE_ROLES,
        MIN_PLAYERS + STEP_CHANGE_ROLES + STEP_CHANGE_ROLES + STEP_CHANGE_ROLES + 1,
    ];

    arr.forEach((count_players: number) => {
        it(`тест с числом игроков равным ${count_players}`, () => {
            // Создаем массив с игроками
            players = Array.apply(null, {length: count_players}).map(() => getPlayer());

            // Отправляем в тестируемую функцию
            game_players = Player.RolesForPlayers(players);

            // По приходу из коллекции игроков, забираем у каждого его роль и суем в массив
            roles_array = _.pluck(game_players, 'role');

            // Затем считаем, сколько пришлось игроков на каждую роль
            count_roles = _.countBy(roles_array, _.identity);

            // Поскольку данные персонажи есть не всегда, надо явно проставить ноль для сравнения
            count_roles[Roles.COMMISSAR] = count_roles[Roles.COMMISSAR] || 0;
            count_roles[Roles.WHORE] = count_roles[Roles.WHORE] || 0;

            mafia_count = Math.floor((count_players - MIN_PLAYERS) / STEP_CHANGE_ROLES) + 1;
            doctor_count = 1;
            whore_count = 1;
            commissar_count = count_players >= MIN_PLAYERS + STEP_CHANGE_ROLES ? 1 : 0;

            expect(count_roles[Roles.MAFIA]).toBe(mafia_count);
            expect(count_roles[Roles.DOCTOR]).toBe(doctor_count);
            expect(count_roles[Roles.COMMISSAR]).toBe(commissar_count);
            expect(count_roles[Roles.WHORE]).toBe(whore_count);
            expect(count_roles[Roles.INHABITANT]).toBe(count_players - mafia_count - doctor_count - commissar_count - whore_count);
        });
    });

    it('isEqualMafiaAndOthers simple', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.INHABITANT})
        ];

        expect(isEqualMafiaAndOthers(players)).toBeFalsy();

        players = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        expect(isEqualMafiaAndOthers(players)).toBeTruthy();
    })

    it('isEqualMafiaAndOthers with remove parametr', () => {
        let token_1 = '23423',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.INHABITANT})
            ];

        expect(isEqualMafiaAndOthers(players, token_1)).toBeFalsy();
        expect(isEqualMafiaAndOthers(players)).toBeFalsy();

        players = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.INHABITANT, token: token_1}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        expect(isEqualMafiaAndOthers(players)).toBeFalsy();
        expect(isEqualMafiaAndOthers(players, token_1)).toBeTruthy();
    })

    it('hasMafia simple', () => {
        let players: Array<GamePlayer> = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.COMMISSAR}),
            getGamePlayer({role: Roles.DOCTOR}),
            getGamePlayer({role: Roles.INHABITANT})
        ];

        expect(hasMafia(players)).toBeFalsy();

        players = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.MAFIA}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        expect(hasMafia(players)).toBeTruthy();
    })

    it('hasMafia with remove parametr', () => {
        let token_1 = '23423',
            players: Array<GamePlayer> = [
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.INHABITANT}),
                getGamePlayer({role: Roles.MAFIA}),
                getGamePlayer({role: Roles.INHABITANT, token: token_1}),
                getGamePlayer({role: Roles.INHABITANT})
            ];

        expect(hasMafia(players, token_1)).toBeTruthy();
        expect(hasMafia(players)).toBeTruthy();

        players = [
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.INHABITANT}),
            getGamePlayer({role: Roles.MAFIA, token: token_1}),
            getGamePlayer({role: Roles.DOCTOR})
        ];

        expect(hasMafia(players)).toBeTruthy();
        expect(hasMafia(players, token_1)).toBeFalsy();
    })
});