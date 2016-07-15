import {createStore, combineReducers} from 'redux';
import RoomReducer from '../reducers/RoomReducer';
import RoomAction from '../actions/RoomAction';
import * as _ from 'underscore';
var cookie_parser = require('cookie');
import {RoomState} from "../entity/States";
import RoomStatus from "../entity/RoomStatus";
import set = Reflect.set;

export class WebSocketServer {
    constructor(port, ws_server) {
        this.server = new ws_server({ port: port });
        this.initListen();
    }

    initListen() {
        this.server.on('connection', (ws) => {
            let cookie = ws.upgradeReq.headers.cookie && cookie_parser.parse(ws.upgradeReq.headers.cookie),
                has_room = false;
            
            this.rooms = this.rooms.filter(room => !room.isEmpty());

            // Если в массиве комнат уже есть данная комната просто перезаписываем в ней сокет
            if(cookie && cookie.room_token) {
                this.rooms.forEach((room:RoomServer) => {
                   if(room.getToken() === cookie.room_token) {
                       console.log('set new connection');
                       room.setNewConnection(ws);
                       has_room = true;
                   }
                });
            }

            if(!has_room) {
                this.rooms.push(new RoomServer(ws));
            }

            console.log(this.rooms.length);
        });
    }

    private server;
    private rooms = [];

}

class RoomServer {
    constructor(connection) {
        console.log('NEW connection');
        
        let token = getRandomString(32);
        let public_url = getRandomString(5);

        this.store = createStore(combineReducers({
            room: RoomReducer
        }));

        // Сразу создаем комнату
        this.store.dispatch(RoomAction.createRoom(token, public_url));

        // setTimeout(() => {
        //     this.store.dispatch(RoomAction.addPlayer({name: 'Bob', avatar: 'asasf.png', token: 'sdfsdfa3w'}));
        // }, 3000);
        
        // Подписываемся на store и когда время апдейта изменится необходимо просто отправить новое состояние
        this.store.subscribe(() => {
            console.log('store update');
            if(this.store.getState().room.time_last_update > this.time_last_update) {
                this.sendDataToClient();
                this.time_last_update = Date.now();
            }
        });

        // В конце пишем переданный сокет в класс и отправляем по нему текущее состояние
        this.setNewConnection(connection);
    }

    public getToken(): string {
        return this.store.getState().room.token;
    }

    public isEmpty(): boolean {
        return (this.store === null && this.connection === null) ? true : false;
    }
    
    public setNewConnection(connection) {
        this.connection = connection;

        // Подписываемся на события от клиента
        this.connection.on('message', (message) => {
            console.log('received: %s', message);
        });

        // Если соединение было оборвано зануляем сокет
        this.connection.on('close', (message) => {
            this.connection = null;
            setTimeout( () => this.clear(), 5000);
        });


        // Отправляем состояние комнаты клиенту
        this.sendDataToClient();
    }

    private clear() {
        this.store = null;
        this.time_last_update = null;
    }

    private sendDataToClient() {
        this.connection.send(JSON.stringify(this.getStateRoomForClient()));
    }


    private getStateRoomForClient() {
        let state = _.clone(this.store.getState().room);

        // delete state.token;
        delete state.time_last_update;
        delete state.time_last_update_players;

        return state;
    }

    private connection;
    private store;
    private time_last_update: number = Date.now();
}


function getRandomString(len: number) {
    let str: string = '123456789qwertyuiopasdfghjklzxcvbnm',
        arr_symbols = str.split(''),
        random_str = '';

    while(len--){
        random_str += arr_symbols[Math.floor(Math.random() * str.length)];
    }

    return random_str;
}