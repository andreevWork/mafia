import {StateMainClient, StatePlayerClient} from "../../../logic/src/entity/States";
import {
    IMessageFromServer, STATE, IDataToServer, PLAYER_STATE, AUTH_TYPE, UNAUTHORIZED, IPlayerLoginMessage,
    IAction, ACTION_TYPE
} from "../../../logic/src/server/IMessage";
var config = require('../../../config');

export interface IWebSocketService {
    onNewState(call_back: IWebSocketStateListener<StateMainClient>): void;
    onUnauthorized(call_back: IWebSocketListener): void;
    onNewPlayerState(call_back: IWebSocketStateListener<StatePlayerClient>): void;
    sendAuthMessage(message: IPlayerLoginMessage): void;
    sendActionMessage(message: IAction): void;
}

export interface IOptions {
    path: string;
}

export type IWebSocketStateListener<State> = (new_state: State) => void;
export type IWebSocketListener = () => void;

export default class WebSocketService implements IWebSocketService {

    constructor(options: IOptions) {
        this.connection = new WebSocket(`ws://${config.domain}:${config.web_socket_port}${options.path}`);
    }

    sendAuthMessage(message: IPlayerLoginMessage) {
        let data: IDataToServer = {
            type: AUTH_TYPE,
            data: message
        };
        
        this.connection.send(JSON.stringify(data));
    }

    sendActionMessage(message: IAction) {
        let data: IDataToServer = {
            type: ACTION_TYPE,
            data: message
        };

        this.connection.send(JSON.stringify(data));
    }

    /*
     * Метод который позволяет подписаться на обновления состония пришедшего из сокета
     */
    public onNewState(call_back: IWebSocketStateListener<StateMainClient>): void {
        this.state_listeners.push(call_back);

        this.subscribeOnSocketUpdate();
    }


    public onUnauthorized(call_back: IWebSocketListener): void {
        this.unauthorized_listeners.push(call_back);

        this.subscribeOnSocketUpdate();
    }

    public onNewPlayerState(call_back: IWebSocketStateListener<StatePlayerClient>): void {
        this.state_players_listeners.push(call_back);

        this.subscribeOnSocketUpdate();
    }

    /*
     * Своеобразная замена addEventListener, поскольку подписок может быть много, в каждом обработчике будет каждый раз парситься состояние.
     * Чтобы этого избежать при каждой новой подписке, мы пересоздаем свойство onmessage у сокета, в итоге у нас всего один коллбэк, где рассылается всем подписчикам инфа
     */
    private subscribeOnSocketUpdate() {
         this.connection.onmessage = (message) => {
             let data: IMessageFromServer = JSON.parse(message.data);

             if(data && data.type === STATE) {
                 this.state_listeners.forEach((listener: IWebSocketStateListener<StateMainClient>) => {
                     listener(data.payload as StateMainClient);
                 });
             }

             if(data && data.type === UNAUTHORIZED) {
                 this.unauthorized_listeners.forEach((listener: IWebSocketListener) => {
                     listener();
                 });
             }

             if(data && data.type === PLAYER_STATE) {
                 this.state_players_listeners.forEach((listener: IWebSocketStateListener<StatePlayerClient>) => {
                     listener(data.payload as StatePlayerClient);
                 });
             }
         }
    }

    private connection;
    private state_listeners: Array<IWebSocketStateListener<StateMainClient>> = [];
    private unauthorized_listeners: Array<IWebSocketListener> = [];
    private state_players_listeners: Array<IWebSocketStateListener<StatePlayerClient>> = [];


    /*
     * Реализация паттерна синглтон, чтобы везде был один инстанс сервиса
     */
    public static createInstance(options: IOptions) {
        this.instance = new WebSocketService(options);
    }

    public static getInstance() {
        return this.instance;
    }

    private static instance: IWebSocketService;
}