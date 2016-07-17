import * as React from "react";

export interface IPublicUrlProps {
    public_url: string;
}

export default class PublicUrl extends React.Component<IPublicUrlProps, void> {
    render() {
        return <div className="room-content__public-url">Для создания игрока перейдите по ссылке: {this.props.public_url}</div>
    }
}

