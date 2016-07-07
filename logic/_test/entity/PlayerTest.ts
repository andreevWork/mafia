import {Player, GamePlayer} from "../../src/entity/Player";
import {getPlayer} from "../mocks/PlayersMocks";
import * as _ from 'underscore';
import Roles from "../../src/entity/Roles";
import {MIN_PLAYERS, STEP_CHANGE_ROLES} from '../../src/entity/GameEnvironment';


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
            whore_count = count_players >= MIN_PLAYERS + STEP_CHANGE_ROLES * 3 ? 1 : 0;
            commissar_count = count_players >= MIN_PLAYERS + STEP_CHANGE_ROLES ? 1 : 0;

            expect(count_roles[Roles.MAFIA]).toBe(mafia_count);
            expect(count_roles[Roles.DOCTOR]).toBe(doctor_count);
            expect(count_roles[Roles.COMMISSAR]).toBe(commissar_count);
            expect(count_roles[Roles.WHORE]).toBe(whore_count);
            expect(count_roles[Roles.INHABITANT]).toBe(count_players - mafia_count - doctor_count - commissar_count - whore_count);
        });
    });
});