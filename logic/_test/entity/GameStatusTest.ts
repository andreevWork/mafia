import {GameStatus, GameStatusHelpers} from '../../src/entity/GameStatus';
import Roles from "../../src/entity/Roles";

describe('GameStatus', () => {
    
    it('getActiveRole', () => {
        expect(GameStatusHelpers.getActiveRole(GameStatus['VOTE_MAFIA'])).toBe(Roles.MAFIA);
        expect(GameStatusHelpers.getActiveRole(GameStatus['VOTE_INHABITANT'])).toBe(Roles.INHABITANT);
        expect(GameStatusHelpers.getActiveRole(GameStatus['DAY_AFTER_NIGHT'])).toBeNull();
        expect(GameStatusHelpers.getActiveRole(GameStatus['WAKE_UP_INHABITANT'])).toBeNull();
    });
});