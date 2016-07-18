import {StateMainClient, StatePlayerClient} from "../entity/States";
import RoomAction from "../actions/RoomAction";
export interface IPlayerLoginMessage {
    name: string;
}

export enum MainAction {
    START_GAME
}

export interface IAction {
    action: MainAction
}

export interface IAnswer {

}

export interface IRequest {

}

export const UNAUTHORIZED = 'unauthorized';


export const STATE = 'state';
export const PLAYER_STATE = 'player_state';

export const AUTH_TYPE = 'auth_type';
export const ACTION_TYPE = 'action_type';

export type IDataToServer = IAction | IRequest | IPlayerLoginMessage;
export type IDataFromServer = StateMainClient | IAnswer | StatePlayerClient;

export interface IMessageToServer {
    type: string;
    data: IDataToServer;
}

export interface IMessageFromServer {
    type: string;
    payload: IDataFromServer;
}