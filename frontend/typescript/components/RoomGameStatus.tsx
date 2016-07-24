import * as React from "react";
import {GameStatus} from "../../../logic/src/entity/GameStatus";
import WebSocketService from "../services/WebSocketService";
import {MainAction} from "../../../logic/src/server/IMessage";
import {getGameStateWithPlayersAndExecution} from "../../../logic/_test/mocks/GameStateMocks";

export interface IRoomGameStatusProps {
    status: GameStatus;
    killed?: Array<string>;
    execution?: string;
}

export default class RoomGameStatus extends React.Component<IRoomGameStatusProps, void> {
    render() {
        return <div className="room-content__screen-status">
            {this.renderStatus()}
        </div>
    }

    playAudio(url: string) {
        this.audio = new Audio();
        this.audio.src = url;
        this.audio.autoplay = true;
        this.audio.addEventListener('ended', () => {

            setTimeout(() => {
                let web_socket_service = WebSocketService.getInstance();

                web_socket_service.sendActionMessage({
                    action:  MainAction.NEXT_STEP
                });
            }, 1500);
        });
    }

    componentDidUpdate() {
        switch (this.props.status) {
            case GameStatus.FALL_ASLEEP_INHABITANT:
                this.playAudio('fall_asleep_inhabitant.mp3');
                break;

            case GameStatus.WAKE_UP_MAFIA:
                this.playAudio('wake_up_mafia.mp3');
                break;

            case GameStatus.FALL_ASLEEP_MAFIA:
                this.playAudio('fall_asleep_mafia.mp3');
                break;

            case GameStatus.WAKE_UP_DOCTOR:
                this.playAudio('wake_up_doctor.mp3');
                break;

            case GameStatus.FALL_ASLEEP_DOCTOR:
                this.playAudio('fall_asleep_doctor.mp3');
                break;

            case GameStatus.WAKE_UP_WHORE:
                this.playAudio('wake_up_whore.mp3');
                break;

            case GameStatus.FALL_ASLEEP_WHORE:
                this.playAudio('fall_asleep_whore.mp3');
                break;

            case GameStatus.WAKE_UP_COMMISSAR:
                this.playAudio('wake_up_commissar.mp3');
                break;

            case GameStatus.FALL_ASLEEP_COMMISSAR:
                this.playAudio('fall_asleep_commissar.mp3');
                break;

            case GameStatus.WAKE_UP_INHABITANT:
                this.playAudio('wake_up_inhabitant.mp3');
                break;
        }
    }

    renderStatus(): JSX.Element {
        switch (this.props.status) {
            case GameStatus.START_THE_GAME: 
                return this.renderStartScreen();

            case GameStatus.DAY_AFTER_NIGHT:
                return this.renderNecrology();

            case GameStatus.DAY_BEFORE_NIGHT:
                return this.renderExecution();

            case GameStatus.VOTE_INHABITANT:
                return this.renderWaitVote();

            default:
                return this.renderNightScreen();
        }
    }

    renderWaitVote(): JSX.Element {
        return <div className="room-content__screen-wait-vote">Идет голосование. По его результатам будет казнен один из жителей.</div>
    }

    renderNightScreen(): JSX.Element {
        return <div className="room-content__screen-night">Ночь. Город спит.</div>
    }

    renderNecrology(): JSX.Element {
        return <div className="room-content__screen-necrology">
            {(this.props.killed && this.props.killed.length) ? ( this.props.killed.length === 2 ? <div>Были убиты игроки: {this.props.killed[0]} и {this.props.killed[1]}</div> : <div>Был убит игрок: {this.props.killed[0]}</div>) : <div>Никого не убили</div>}
            <br />
            <div className="btn" onClick={() => this.sendNextStepAction()}>Начать голосование</div>
        </div>
    }

    renderExecution(): JSX.Element {
        return <div className="room-content__screen-necrology">
            <div>Был казнен игрок: {this.props.execution}</div>
            <br />
            <div className="btn" onClick={() => this.sendNextStepAction()}>Начать ночь</div>
        </div>
    }

    renderStartScreen(): JSX.Element {
        return <span className="btn" onClick={() => this.sendNextStepAction()}>Начать ночь</span>;
    }
    
    sendNextStepAction() {
        let web_socket_service = WebSocketService.getInstance();

        web_socket_service.sendActionMessage({
            action:  MainAction.NEXT_STEP
        });
    }

    private audio;
}

