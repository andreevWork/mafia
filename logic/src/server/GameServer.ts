import * as _ from 'underscore';
var cookie_parser = require('cookie');
import {RoomState} from "../entity/States";
import RoomStatus from "../entity/RoomStatus";
import set = Reflect.set;
import {IRolesMapping, RolesMapping} from "../entity/Roles";
import RoomServer from "./RoomServer";
import {getRandomString} from "../utils/helpers";
var config = require('../../../config');

export const ROOM_COOKIE_TOKEN = 'ROOMID';

export class GameServer {
    constructor(web_socket_server_rooms) {
        // Переменная типа хэш-таблицы, для токенов комнат, необходима т. к. комната создается в одном месте, а запрос в котоый можно вписать куку в другом месте, необходим посредник
        let room_cookie_token: _.Dictionary<string> = {};
        
        /*
         * Событик происходит когда отправляется http запрос для рукапожатия, здесь можно и нужно писать необходимые куки
         */
        web_socket_server_rooms.on(`headers${config.web_socket_path.room}`, (headers, upgradeReqHeaders) => {
            let cookie = upgradeReqHeaders.cookie ? cookie_parser.parse(upgradeReqHeaders.cookie) : {};

            // Если нет комнаты, генерим токен для новой и отсылаем его
            if(!this.hasRoom(cookie[ROOM_COOKIE_TOKEN])) {
                let token = getRandomString(32);

                room_cookie_token[upgradeReqHeaders['sec-websocket-key']] = token;

                headers.push(`Set-Cookie: ${cookie_parser.serialize(ROOM_COOKIE_TOKEN, token, {
                    httpOnly: true
                })}`);
            }
        });
        
        web_socket_server_rooms.on(`connection${config.web_socket_path.room}`, (socket) => {
            let cookie = socket.upgradeReq.headers.cookie ? cookie_parser.parse(socket.upgradeReq.headers.cookie) : {},
                exist_room;

            // Пытаемся найти комнату по пришедшим кукам
            exist_room = this.getRoomByToken(cookie[ROOM_COOKIE_TOKEN]);

            // Если комната есть, просто запишем в нее новое соединение
            if(exist_room) {
                // Если вдруг у найденной комнаты все еще есть подключение с кем-то, не будем его перезаписывать, просто сообщим что комната занята и закроем соединение
                if(exist_room.hasConnection()) {
                    GameServer.killSocket(socket);
                    return;
                }

                console.log('set new connection');
                exist_room.setNewConnection(socket);
            } else {
                this.rooms.push(new RoomServer(socket, room_cookie_token[socket.upgradeReq.headers['sec-websocket-key']], () => this.removeEmptyRooms()));
                
                delete room_cookie_token[socket.upgradeReq.headers['sec-websocket-key']];
            }

            console.log(this.rooms.length);
        });
    }

    private static killSocket(socket) {
        socket.send(JSON.stringify('exist!!'));
        socket.close(1000);
    }

    // Метод проходится по комнатам и смотрит что бы у них было активное соединение и состояние иначе, комната ранее была самоочищена из-за неактивности и теперь ее надо просто удалить из массива
    private removeEmptyRooms() {
        this.rooms = this.rooms.filter((room:RoomServer) => !room.isEmpty());
    }
    
    private getRoomByToken(token: string): RoomServer {
        return token && this.rooms.find((room:RoomServer) => room.getToken() === token);
    }

    private getRoomByPublicUrl(public_url: string) {
        return public_url && this.rooms.find((room:RoomServer) => room.getPublicUrl() === public_url);
    };

    public hasRoom(token: string): boolean {
        return !!this.getRoomByToken(token) || !!this.getRoomByPublicUrl(token);
    }

    public removeRoom(token: string): void {
        this.rooms = this.rooms.filter((room:RoomServer) => room.getToken() !== token);
    }
    
    public static getRoles(): _.Dictionary<IRolesMapping> {
        return RolesMapping;
    }

    public static getRoomToken(): string {
        return ROOM_COOKIE_TOKEN;
    }

    private rooms = [];

}