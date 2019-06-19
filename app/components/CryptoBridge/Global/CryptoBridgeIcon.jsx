import React from "react";

export default class CryptoBridgeIcon extends React.Component {
    render() {
        return (
            <img
                src={`${__BASE_URL__}cryptobridge/cryptobridge-logo.svg`}
                style={{maxWidth: 32, minWidth: 24}}
            />
        );
    }
}
