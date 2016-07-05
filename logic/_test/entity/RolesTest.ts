import Roles from '../../src/entity/Roles';

describe('Roles', () => {

    it('isMafia', () => {
        expect(Roles.isMafia(Roles.MAFIA)).toBeTruthy();
        expect(Roles.isMafia(Roles.DOCTOR)).toBeFalsy();
    })
});