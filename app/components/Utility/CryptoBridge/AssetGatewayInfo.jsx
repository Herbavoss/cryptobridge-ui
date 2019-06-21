import React from "react";
import PropTypes from "prop-types";
import ChainTypes from "../ChainTypes";
import Translate from "react-translate-component";
import {
    getCleanAssetSymbol,
    getRealAssetName
} from "lib/cryptobridge/assetMethods";
import {Alert} from "bitshares-ui-style-guide";

export default class AssetGatewayInfo extends React.Component {
    static propTypes = {
        asset: ChainTypes.ChainAsset.isRequired,
        filter: PropTypes.oneOf(["none", "deposit", "withdrawal"]).isRequired,
        minDeposit: PropTypes.number.isRequired
    };

    static defaultProps = {
        filter: "none",
        minDeposit: 0
    };

    render() {
        const {asset, filter, minDeposit} = this.props;

        let messages = [];

        if (asset.info) {
            messages = asset.info.filter(message => message.type === "error");
            if (!messages.length) {
                messages = asset.info.filter(
                    message => message.type !== "error"
                );
            }
        }

        return (
            <ul className={"asset-gateway-info"}>
                {messages &&
                    messages.map((info, i) => {
                        if (
                            !info.section ||
                            info.section === filter ||
                            filter === "none"
                        ) {
                            const message = info.text;
                            let type = info.type;

                            if (type === "warn") {
                                type = "warning";
                            }

                            return (
                                <li
                                    key={`assetInfo${i}`}
                                    className={`asset-gateway-info__${
                                        info.type
                                    }`}
                                >
                                    <Alert message={message} type={type} />
                                </li>
                            );
                        }
                    })}

                {filter !== "withdrawal" && asset.depositFeeEnabled ? (
                    <li className="asset-gateway-info__warn">
                        <Alert
                            message={
                                <Translate
                                    content="cryptobridge.gateway.deposit.fee_warning"
                                    with={{
                                        asset: asset.name,
                                        fee_time_frame:
                                            asset.depositFeeTimeframe,
                                        fee_percentage:
                                            asset.depositFeePercentage,
                                        fee_percentage_low_amounts:
                                            asset.depositFeePercentageLowAmounts,
                                        fee_minimum: asset.depositFeeMinimum
                                    }}
                                />
                            }
                            type={"warning"}
                        />
                    </li>
                ) : null}

                {filter !== "withdrawal" && minDeposit ? (
                    <li className="asset-gateway-info">
                        <Alert
                            message={
                                <Translate
                                    content="gateway.min_deposit_warning_asset"
                                    minDeposit={minDeposit}
                                    coin={getRealAssetName(
                                        getCleanAssetSymbol(asset.symbol)
                                    )}
                                />
                            }
                            type={"info"}
                        />
                    </li>
                ) : null}

                {filter !== "withdrawal" &&
                    asset.requiredConfirmations > 0 && (
                        <li className="asset-gateway-info">
                            <Alert
                                message={
                                    <Translate
                                        content="cryptobridge.gateway.deposit.required_confirmations"
                                        with={{
                                            required_confirmations:
                                                asset.requiredConfirmations
                                        }}
                                    />
                                }
                                type={"info"}
                            />
                        </li>
                    )}
            </ul>
        );
    }
}
