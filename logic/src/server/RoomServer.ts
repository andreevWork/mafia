import {createStore, combineReducers} from 'redux';
import RoomReducer from "../reducers/RoomReducer";
import RoomAction from "../actions/RoomAction";
import {
    RoomMainClientState, StateMainClient, GameMainClientState, GameState, RoomState,
    StatePlayerClient, IDataObjectPlayerClient
} from "../entity/States";
import GameReducer from "../reducers/GameReducer";
import * as _ from 'underscore';
import {getRandomString} from "../utils/helpers";
import {Player, GamePlayer} from "../entity/Player";
import {
    IPlayerLoginMessage, IMessageFromServer, PLAYER_STATE, STATE, IDataToServer, MainAction,
    IMessageToServer, ACTION_TYPE, VOTE_TYPE
} from "./IMessage";
import GameAction from "../actions/GameAction";
import RoomStatus from "../entity/RoomStatus";
import {GameStatusHelpers, GameStatus} from "../entity/GameStatus";
import {VoteObject} from "../entity/Vote";


export default class RoomServer {
    constructor(connection, token, private clear_callback) {
        console.log('NEW connection');

        let public_url = getRandomString(5);

        this.store = createStore(combineReducers({
            room: RoomReducer,
            game: GameReducer
        }));

        // Сразу создаем комнату
        this.store.dispatch(RoomAction.createRoom(token, public_url));

        // setTimeout(() => {
        //     this.store.dispatch(RoomAction.addPlayer({name: 'Bob', avatar: 'asasf.png', token: 'sdfsdfa3w'}));
        // }, 3000);

        // Подписываемся на store и когда время апдейта изменится необходимо просто отправить новое состояние
        this.store.subscribe(() => {
            console.log('store update');

            // Если время последнео отправленного состояние меньше времени последнего его именения необходимо синхронизировать
            if(this.store.getState().room.time_last_update > this.time_last_update || this.store.getState().game.time_last_update > this.time_last_update) {
                this.sendStateToClient();
                this.time_last_update = Date.now();
            }

            // Тоже самое для игроков
            if(this.store.getState().game.time_last_update_players > this.time_last_update_players) {
                this.store.getState().game.players
                    .filter((player: GamePlayer) => {
                        if(this.store.getState().game.active_roles && this.store.getState().game.active_roles.length) {
                            return !!~this.store.getState().game.active_roles.indexOf(player.role);
                        }

                        if(this.store.getState().game.round_data) {
                            if(this.store.getState().game.round_data.killed && this.store.getState().game.round_data.killed.length) {
                                return !!~this.store.getState().game.round_data.killed.indexOf(player.token);
                            }

                            if(this.store.getState().game.round_data.execution) {
                                return this.store.getState().game.round_data.execution === player.token;
                            }
                        }

                        return true;
                    })
                    .forEach((player: Player) => {
                        this.sendPlayerStateToClient(player.token);
                    });
                this.time_last_update_players = Date.now();
            }

            // Если в массиве голосования не осталось ни одного без голоса меняем состояние
            if(this.store.getState().game.votes.length && !this.store.getState().game.votes.find((vote: VoteObject) => !vote.for_whom_token)) {
                this.store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(this.store.getState().game)));
            }
        });

        // В конце пишем переданный сокет в класс и отправляем по нему текущее состояние
        this.setNewConnection(connection);
    }
    
    public setPlayer(name, token) {
        this.store.dispatch(RoomAction.addPlayer({name, token}));
    }

    public setNewPlayerConnection(token, connection) {
        this.players_connections[token] = connection;
        
        // Подписываемся на события от игрока
        connection.on('message', (message) => {
            let data: IMessageToServer = JSON.parse(message);

            switch (data.type) {
                case VOTE_TYPE:
                    this.store.dispatch(GameAction.vote(token, data.data['token']));
                    break;
            }
        });

        // Если соединение было оборвано зануляем сокет
        connection.on('close', (message) => {
            this.players_connections[token] = null;
        });

        // Отправляем состояние комнаты клиенту
        this.sendPlayerStateToClient(token);
    }

    public getToken(): string {
        return this.store.getState().room.token;
    }

    public hasPlayer(token: string): boolean {
        return !!this.store.getState().room.players.find((player: Player) => player.token === token);
    }

    public getPlayerByToken(token: string): Player {
        return this.store.getState().room.players.find((player: Player) => player.token === token);
    }

    public getPublicUrl(): string {
        return this.store.getState().room.public_url;
    }

    public isEmpty(): boolean {
        return (this.store === null && this.connection === null) ? true : false;
    }

    public hasConnection(): boolean {
        return this.connection !== null;
    }

    public setNewConnection(connection) {
        // Если есть таймер удаления убираем его т. к. переподключились
        if(this.clear_timer) {
            clearTimeout(this.clear_timer);
        }

        this.connection = connection;

        // Подписываемся на события от клиента
        this.connection.on('message', (message: string) => {
            let data: IMessageToServer = JSON.parse(message);
            
            switch (data.type) {
                case ACTION_TYPE:
                    if(data.data['action'] === MainAction.START_GAME) {
                        this.store.dispatch(RoomAction.startPlay());
                        this.store.dispatch(GameAction.createGame(Player.RolesForPlayers(this.store.getState().room.players)));
                    }
                    
                    if(data.data['action'] === MainAction.NEXT_STEP) {
                        this.store.dispatch(GameAction.nextGameStep(GameStatusHelpers.getNextStatus(this.store.getState().game)));
                    }
                    
                    break;
            }
        });

        // Если соединение было оборвано зануляем сокет и ставим на таймер удаление комнаты
        this.connection.on('close', (message) => {
            this.connection = null;
            this.clear_timer = setTimeout( () => this.clear(), this.clear_timer_time);
        });

        // Отправляем состояние комнаты клиенту
        this.sendStateToClient();
    }

    private clear() {
        this.store = null;
        this.time_last_update = null;
        this.clear_timer = null;
        this.clear_callback();
    }
    
    private sendStateToClient() {
        this.sendDataToClient({
            type: STATE,
            payload: this.getStateForClient()
        });
    }
    
    private sendPlayerStateToClient(token: string) {
        this.sendPlayerDataToClient({
            type: PLAYER_STATE,
            payload: this.getPlayerStateForClient(token)
        }, token);
    }

    private sendDataToClient(data: IMessageFromServer) {
        this.connection.send(JSON.stringify(data));
    }

    private sendPlayerDataToClient(data: IMessageFromServer, token: string) {
        this.players_connections[token].send(JSON.stringify(data));
    }

    private getStateForClient(): StateMainClient {
        return {
            room : this.getStateRoomForClient(),
            game: this.getStateGameForClient()
        }
    }

    private getPlayerStateForClient(token: string): StatePlayerClient {
        let is_wait: boolean = this.store.getState().room.status !== RoomStatus.PLAYING,
            data: IDataObjectPlayerClient = { role: null, name : null };

        if(!is_wait) {
            let player: GamePlayer = this.store.getState().game.players.find((player: Player) => player.token === token);
            
            data.role = player.role;
            data.name = player.name;
            data.vote_variants = this.store.getState().game.vote_variants.map((token: string) => {
                return {
                    token: token,
                    name: this.getPlayerByToken(token).name
                };
            });

            if(this.store.getState().game.status === GameStatus.VOTE_INHABITANT) {
                data.vote_variants = data.vote_variants.filter(obj => obj.token !== token);
            }

            if(this.store.getState().game.round_data && 
                this.store.getState().game.round_data.killed && 
                this.store.getState().game.round_data.killed.length && 
                !!~this.store.getState().game.round_data.killed.indexOf(token)) {
                data.is_killed = true;
            }

            if(this.store.getState().game.round_data &&
                this.store.getState().game.round_data.execution &&
                this.store.getState().game.round_data.execution == token) {
                data.is_killed = true;
            }
        }

        return {
            is_wait,
            data
        }
    }

    private getStateGameForClient(): GameMainClientState {
        let state: GameState = _.clone(this.store.getState().game);

        delete state.players;
        delete state.vote_variants;
        delete state.votes;
        delete state.active_roles;
        delete state.prev_round_healing;
        delete state.time_last_update;
        delete state.time_last_update_players;

        if(state.round_data && (state.round_data.killed || state.round_data.execution)) {
            state.round_data = _.clone(state.round_data);

            if(state.round_data.killed && state.round_data.killed.length) {
                // На фронте массив сразу отрисовывается поэтому сразу заменим токены убитых на их имена
                state.round_data.killed = state.round_data.killed.map(token => this.getPlayerByToken(token).name);
            }

            if(state.round_data.execution) {
                state.round_data.execution = this.getPlayerByToken(state.round_data.execution).name;
            }
        }

        return state;
    }


    private getStateRoomForClient(): RoomMainClientState {
        let state: RoomState = _.clone(this.store.getState().room);

        delete state.token;
        delete state.time_last_update;
        delete state.time_last_update_players;

        return state;
    }

    private connection;
    private players_connections = {};
    private store;
    private time_last_update: number = Date.now();
    private time_last_update_players: number = Date.now();
    private clear_timer;
    private clear_timer_time: number = 1000 * 60 * 2;
}