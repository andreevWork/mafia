import * as React from "react";
import WebSocketService from "../services/WebSocketService";

export interface IPlayerLoginProps {
}

export interface IPlayerLoginState {
    name: string;
}

export default class PlayerLogin extends React.Component<IPlayerLoginProps, IPlayerLoginState> {

    state = {
        name: ''
    };

    onChange(e) {
        this.setState({
            name: e.target.value.trim()
        })
    }

    onSubmit(e) {
        e.preventDefault();
        
        if(!this.state.name) return alert('Введите имя');

        let web_socket_service = WebSocketService.getInstance();

        web_socket_service.sendAuthMessage({
            name: this.state.name
        });
    }

    render() {
        return <div className="player-container">
            <form className="player-container__login" onSubmit={(e) => this.onSubmit(e) }>
                <input type="text" onChange={(e) => this.onChange(e)} value={this.state.name} />
                <label>Введите свое имя</label>
                <br />
            </form>
        </div>
    }
}

