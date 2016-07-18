import * as _ from 'underscore';
var cookie_parser = require('cookie');
import {RoomState} from "../entity/States";
import RoomStatus from "../entity/RoomStatus";
import set = Reflect.set;
import {IRolesMapping, RolesMapping} from "../entity/Roles";
import RoomServer from "./RoomServer";
import {getRandomString} from "../utils/helpers";
import {AUTH_TYPE, IMessageToServer, UNAUTHORIZED, IPlayerLoginMessage} from "./IMessage";
var config = require('../../../config');

export const ROOM_COOKIE_TOKEN = 'ROOMID';
export const PLAYER_COOKIE_TOKEN = 'PLAYERID';
export const ROOMURL_COOKIE_TOKEN = 'ROOMURL';

export class GameServer {

    public static getRoles(): _.Dictionary<IRolesMapping> {
        return RolesMapping;
    }

    public static getRoomToken(): string {
        return ROOM_COOKIE_TOKEN;
    }

    public static getRoomUrlToken(): string {
        return ROOMURL_COOKIE_TOKEN;
    }


    constructor(private ws) {
       this.initRooms();
       this.initPlayers();
    }



    public hasRoom(token: string): boolean {
        return !!this.getRoomByToken(token) || !!this.getRoomByPublicUrl(token);
    }

    public removeRoom(token: string): void {
        this.rooms = this.rooms.filter((room:RoomServer) => room.getToken() !== token);
    }



    private static killSocket(socket) {
        socket.send(JSON.stringify('exist!!'));
        socket.close(1000);
    }
    
    private initPlayers() {
        // Переменная типа хэш-таблицы, для токенов комнат, необходима т. к. комната создается в одном месте, а запрос в котоый можно вписать куку в другом месте, необходим посредник
        let players_cookie_token: _.Dictionary<string> = {};

        /*
         * Событик происходит когда отправляется http запрос для рукапожатия, здесь можно и нужно писать необходимые куки
         */
        this.ws.on(`headers${config.web_socket_path.players}`, (headers, upgradeReqHeaders) => {
            let cookie = upgradeReqHeaders.cookie ? cookie_parser.parse(upgradeReqHeaders.cookie) : {},
                room = this.getRoomByPublicUrl(cookie[ROOMURL_COOKIE_TOKEN]);
            
            if(!room) return;

            // if(!room.hasPlayer(cookie[PLAYER_COOKIE_TOKEN])) {
                let token = getRandomString(32);

                players_cookie_token[upgradeReqHeaders['sec-websocket-key']] = token;

                headers.push(`Set-Cookie: ${cookie_parser.serialize(PLAYER_COOKIE_TOKEN, token, {
                    httpOnly: true
                })}`);
            // }
        });

        this.ws.on(`connection${config.web_socket_path.players}`, (socket) => {
            let cookie = socket.upgradeReq.headers.cookie ? cookie_parser.parse(socket.upgradeReq.headers.cookie) : {},
                room = this.getRoomByPublicUrl(cookie[ROOMURL_COOKIE_TOKEN]),
                exist_player;

            // Пытаемся найти игрока в комнате
            exist_player = room.getPlayerByToken(cookie[PLAYER_COOKIE_TOKEN]);

            // Если игрок есть, просто запишем новое соединение
            // if(exist_player) {
            //     console.log('set new player');
            //     room.setNewPlayerConnection(exist_player.token, socket);
            // } else {
                this.waitAuthPlayer(socket, room, players_cookie_token[socket.upgradeReq.headers['sec-websocket-key']]);
                
                delete players_cookie_token[socket.upgradeReq.headers['sec-websocket-key']];
                
                // И отсылает игроку сообщение что нужно авторизоваться
                socket.send(JSON.stringify({type: UNAUTHORIZED}));
            // }
        });
    }
    
    private waitAuthPlayer(socket, room,  token) {

        socket.once('message', AuthPlayer);

        function AuthPlayer(message: string) {
            let data: IMessageToServer  = JSON.parse(message);

            if(data.type === AUTH_TYPE) {
                room.setPlayer(data.data['name'], token);
                room.setNewPlayerConnection(token, socket);
            } else {
                socket.once('message', AuthPlayer);
            }
        }
    }

    private initRooms() {
        // Переменная типа хэш-таблицы, для токенов комнат, необходима т. к. комната создается в одном месте, а запрос в котоый можно вписать куку в другом месте, необходим посредник
        let room_cookie_token: _.Dictionary<string> = {};

        /*
         * Событик происходит когда отправляется http запрос для рукапожатия, здесь можно и нужно писать необходимые куки
         */
        this.ws.on(`headers${config.web_socket_path.room}`, (headers, upgradeReqHeaders) => {
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

        this.ws.on(`connection${config.web_socket_path.room}`, (socket) => {
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

    private removeEmptyRooms() {
        this.rooms = this.rooms.filter((room:RoomServer) => !room.isEmpty());
    }

    private getRoomByToken(token: string): RoomServer {
        return token && this.rooms.find((room:RoomServer) => room.getToken() === token);
    }

    private getRoomByPublicUrl(public_url: string) {
        return public_url && this.rooms.find((room:RoomServer) => room.getPublicUrl() === public_url);
    };


    private rooms: Array<RoomServer> = [];
}