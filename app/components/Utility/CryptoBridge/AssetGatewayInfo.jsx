import React from "react";
import PropTypes from "prop-types";
import ChainTypes from "../ChainTypes";
import Translate from "react-translate-component";

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

        if (!asset || !asset.info || !asset.info.length > 0) {
            return "";
        }

        return (
            <ul className={"asset-gateway-info"}>
                {asset.info.map((info, i) => {
                    if (
                        !info.section ||
                        info.section === filter ||
                        filter === "none"
                    ) {
                        return (
                            <li
                                key={`assetInfo${i}`}
                                className={`asset-gateway-info__${info.type}`}
                            >
                                {info.text}
                            </li>
                        );
                    }
                })}

                {asset.depositFeeEnabled ? (
                    <Translate
                        component="li"
                        className="asset-gateway-info__warn"
                        content="cryptobridge.gateway.deposit_to_fee_warning"
                        with={{
                            asset: asset.name,
                            fee_time_frame: asset.depositFeeTimeframe,
                            fee_percentage: asset.depositFeePercentage,
                            fee_percentage_low_amounts:
                                asset.depositFeePercentageLowAmounts,
                            fee_minimum: asset.depositFeeMinimum
                        }}
                    />
                ) : null}

                {minDeposit ? (
                    <Translate
                        component="li"
                        className="asset-gateway-info"
                        content="gateway.min_deposit_warning_asset"
                        minDeposit={minDeposit}
                        coin={asset.symbol}
                    />
                ) : null}

                {asset.requiredConfirmations > 0 && (
                    <Translate
                        component="li"
                        content="cryptobridge.gateway.required_confirmations"
                        with={{
                            required_confirmations: asset.requiredConfirmations
                        }}
                    />
                )}
            </ul>
        );
    }
}
