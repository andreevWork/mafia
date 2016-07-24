import * as React from "react";
import {StatePlayerClient} from "../../../logic/src/entity/States";
import Players from "./Players";
import PlayerLogin from "./PlayerLogin";
import {RolesMapping} from "../../../logic/src/entity/Roles";
import WebSocketService from "../services/WebSocketService";

export interface IPlayerProps extends StatePlayerClient {
}

interface IPlayerScreenState {
    el: JSX.Element;
}

interface IPlayerComponentState {
    is_back?: boolean;
    client?: StatePlayerClient;
}

export default class PlayerScreen extends React.Component<void, IPlayerScreenState> {
    
    state = {
        el: <div></div>
    };

    componentDidMount() {
        let web_socket_service = WebSocketService.getInstance();

        web_socket_service.onUnauthorized(() => {
            this.setState({
                el: <PlayerLogin />
            });
        });

        web_socket_service.onNewPlayerState((new_state: StatePlayerClient) => {
            this.setState({
                el: <PlayerComponent {...new_state} />
            });
        });
    }
    
    render() {
        return <div>
            {this.state.el}
        </div>;
    }
}

class PlayerComponent extends React.Component<IPlayerProps, IPlayerComponentState> {

    render() {
        if(this.props.is_wait) {
            return <WaitStartGame />;
        }

        if(this.props.data.is_killed) {
            return <WasKilled />;
        }
        
        return <PlayerRender {...this.props} />;
    }
}

class PlayerRender extends React.Component<IPlayerProps, IPlayerComponentState> {

    state = {
        is_back: true,
        client: this.props
    };

    componentWillReceiveProps(nextProps: IPlayerProps) {
        this.setState({
            client: nextProps
        })
    }

    turnCard() {
        this.setState({
            is_back: !this.state.is_back
        })
    }

    render() {
        return <div className="player-container">
            <header className="player-header">
                <span>{`Ваш ник: ${this.state.client.data.name}`}</span>
            </header>
            {!this.state.client.data.vote_variants.length ? <div className="player-container__card-block">
                    <div className="card__animation-container">
                        <div className={ this.state.is_back ? "card__animation" : "card__animation flip" } onClick={() => this.turnCard()}>
                            <img src="back.png" className="card card--big card__card-back" />
                            <img src={RolesMapping[this.state.client.data.role].card_img} className="card card--big card__card-value" />
                        </div>
                    </div>
                </div>
            :
                <div className="player-content">
                    <Players
                        title="Выберите игрока: "
                        onClick={(token: string) => this.playerVote(token)}
                        players={this.state.client.data.vote_variants} />
                </div>
            }
        </div>;
    }

    private playerVote(token: string) {
        if(confirm('Вы уверены?')) {
            let web_socket_service = WebSocketService.getInstance();

            web_socket_service.sendVoteMessage({
                token
            });

            this.setState({
                client: {
                    is_wait: this.state.client.is_wait,
                    data : {
                        role: this.state.client.data.role,
                        name: this.state.client.data.name,
                        vote_variants: []
                    }
                }
            })
        }
    }
}

const WaitStartGame = () => {
  return   <div className="player-container player-container__wait">
        <div className="player-container__wait-text">
            Вы подключены к комнате, ожидайте начала игры.
        </div>
  </div>;
};

const WasKilled = () => {
    return   <div className="player-container player-container__killed">
        <div className="player-container__killed-text">
            Вы были убиты, с этого момента вы обязаны молчать и ждать окончания игры.
        </div>
    </div>;
};

