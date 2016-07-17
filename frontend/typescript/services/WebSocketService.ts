import {StateMainClient} from "../../../logic/src/entity/States";
import {IMessageFromServer} from "../../../logic/src/server/RoomServer";
var config = require('../../../config');

export interface IWebSocketService {
    onNewState(call_back: (new_state: StateMainClient) => void): void;
}

export type IWebSocketStateListener = (new_state: StateMainClient) => void;

export default class WebSocketService implements IWebSocketService {

    constructor() {
        this.connection = new WebSocket(`ws://${config.domain}:${config.web_socket_port}${config.web_socket_path.room}`);
    }

    /*
     * Метод который позволяет подписаться на обновления состония пришедшего из сокета
     */
    public onNewState(call_back: IWebSocketStateListener): void {
        this.state_listeners.push(call_back);

        this.subscribeOnSocketUpdate();
    }

    /*
     * Своеобразная замена addEventListener, поскольку подписок может быть много, в каждом обработчике будет каждый раз парситься состояние.
     * Чтобы этого избежать при каждой новой подписке, мы пересоздаем свойство onmessage у сокета, в итоге у нас всего один коллбэк, где рассылается всем подписчикам инфа
     */
    private subscribeOnSocketUpdate() {
         this.connection.onmessage = (message) => {
             let data: IMessageFromServer = JSON.parse(message.data);

             if(data && data.type === 'state') {
                 this.state_listeners.forEach((listener: IWebSocketStateListener) => {
                     listener(data.payload as StateMainClient);
                 });
             }
         }
    }

    private connection;
    private state_listeners: Array<IWebSocketStateListener> = [];



    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new WebSocketService();
        }
        return this.instance;
    }

    private static instance: IWebSocketService;
}