import * as _ from 'underscore';

/*
* Самая базовая сущность в игре
 */
enum Roles {
    INHABITANT,
    MAFIA,
    DOCTOR,
    COMMISSAR,
    WHORE
}

// Запишем строковые названия ролей в отдельную переменную
export const RolesKeys = _.keys(Roles).filter((key: string) => _.isNaN(+key));

export default Roles;