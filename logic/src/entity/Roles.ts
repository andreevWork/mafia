enum Roles {
    INHABITANT,
    MAFIA,
    DOCTOR,
    COMMISSAR,
    WHORE
}

namespace Roles {
    export function isMafia(role: Roles) {
        return role === Roles.MAFIA;
    }

    export function isDoctor(role: Roles) {
        return role === Roles.DOCTOR;
    }

    export function isWhore(role: Roles) {
        return role === Roles.WHORE;
    }

    export function isInhabitant(role: Roles) {
        return role === Roles.INHABITANT;
    }

    export function isCommissar(role: Roles) {
        return role === Roles.COMMISSAR;
    }
}

export default Roles;