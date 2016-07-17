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

export interface IRolesMapping {
    title: string;
    description: string;
    card_img: string;
}

export const RolesMapping: _.Dictionary<IRolesMapping> = {};

RolesMapping[Roles.INHABITANT] = {
    title: 'Мирные жители',
    description: 'Играют только “днем”, могут в это время суток, с помощью голосования, казнить одного из игроков. До конца игры не знают, кто из игроков за кого играет.',
    card_img: 'inhabitant.png'
};

RolesMapping[Roles.MAFIA] = {
    title: 'Мафия',
    description: 'Днем прикидываются мирными жителями, ночью просыпаются и убивают мирных жителей. Все Мафиози знают друг друга.',
    card_img: 'mafia.png'
};

RolesMapping[Roles.DOCTOR] = {
    title: 'Доктор',
    description: 'Играет за жителей. Игрок, получивший эту роль, может спасти ночью от смерти одного из игроков.',
    card_img: 'doctor.png'
};

RolesMapping[Roles.COMMISSAR] = {
    title: 'Комиссар',
    description: 'Играет за жителей. Просыпаясь ночью и выбрав одного игрока, он получает ответ на вопрос, является ли указанный человек мафиози.',
    card_img: 'commissar.png'
};

RolesMapping[Roles.WHORE] = {
    title: 'Путана',
    description: 'Играет за жителей. Ночью путана выбирает одного из игроков, которого она спасает от смерти. Отличие только в том, что если убивают доктора, то пациент остается жив. Если же представительница древнейшей профессии сама становится ночной жертвой мафии, то вместе с ней погибает и ее клиент.',
    card_img: 'whore.png'
};


export default Roles;