import React from "react";
import PropTypes from "prop-types";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {Button, Alert} from "bitshares-ui-style-guide";

class AssetGatewayInfoAccept extends React.Component {
    static propTypes = {
        asset: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        tag: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            requiresAcknowledgement: props.tag,
            acknowledged: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.asset !== this.props.asset) {
            this.setState({
                requiresAcknowledgement: this.props.tag,
                acknowledged: false
            });
        } else if (prevProps.children !== this.props.children) {
            this.forceUpdate();
        }
    }

    onAcknowledge = e => {
        e.preventDefault();

        this.setState({
            acknowledged: true
        });
    };

    render() {
        const {asset, name} = this.props;
        const {acknowledged, requiresAcknowledgement} = this.state;

        return (
            <div>
                {!requiresAcknowledgement || acknowledged ? (
                    this.props.children
                ) : (
                    <div>
                        <Alert
                            type={"warning"}
                            message={counterpart.translate(
                                "cryptobridge.gateway.deposit.tag.acknowledgement.alert",
                                {asset: `${asset} (${name})`}
                            )}
                        />
                        <br />
                        <Translate
                            content="cryptobridge.gateway.deposit.tag.acknowledgement.info"
                            asset={`${asset} (${name})`}
                            unsafe
                        />
                        <Button onClick={this.onAcknowledge}>
                            <Translate content="cryptobridge.gateway.deposit.tag.acknowledgement.confirm" />
                        </Button>
                    </div>
                )}
            </div>
        );
    }
}

export default AssetGatewayInfoAccept;
