import * as React from "react";
import {StatePlayerClient} from "../../../logic/src/entity/States";
import {RolesMapping} from "../../../logic/src/entity/Roles";

export interface IPublicUrlProps extends StatePlayerClient {
}

interface IPublicUrlState {
    is_back: boolean;
}

export default class PlayerScreen extends React.Component<IPublicUrlProps, IPublicUrlState> {
    
    state = {
        is_back: true
    };

    turnCard() {
        this.setState({
            is_back: !this.state.is_back
        })
    }
    
    render() {
        console.log(this.props);
        return <div className={this.props.is_wait ?  "player-container player-container__wait" : "player-container"}>
            {this.props.is_wait ? <div className="player-container__wait-text">
                    Вы подключены к комнате, ожидайте начала игры.
                 </div>
                :
                <div className="player-container__card-block">
                    <div className="card__animation-container">
                        <div className={ this.state.is_back ? "card__animation" : "card__animation flip" } onClick={() => this.turnCard()}>
                            <img src="back.png" className="card card--big card__card-back" />
                            <img src={RolesMapping[this.props.data.role].card_img} className="card card--big card__card-value" />
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}

