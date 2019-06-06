import React from "react";
import {connect} from "alt-react";
import BindToChainState from "../Utility/BindToChainState";
import GatewayStore from "stores/GatewayStore";
import counterpart from "counterpart";
import {Select} from "bitshares-ui-style-guide";
/* CRYPTOBRIDGE */
import AssetImage from "components/Utility/CryptoBridge/AssetImage";
/* /CRYPTOBRIDGE */

class DepositWithdrawAssetSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            assets: []
        };
    }

    componentDidMount() {
        this.getAssets();
    }

    getAssets() {
        let {backedCoins, include, includeBTS} = this.props;
        let {assets} = this.state;

        let idMap = {};

        backedCoins.forEach(coin => {
            assets = assets
                .concat(
                    coin.map(item => {
                        /* Gateway Specific Settings */
                        let [gateway, backedCoin] = item.symbol.split(".");

                        // Return null if backedCoin is already stored
                        if (!idMap[backedCoin] && backedCoin && gateway) {
                            idMap[backedCoin] = true;

                            return {
                                id: backedCoin,
                                label: backedCoin,
                                name: item.name,
                                gateway: gateway,
                                gateFee: item.gateFee,
                                issuer: item.issuerId || "1.2.96397" //Fall back to open ledger
                            };
                        } else {
                            return null;
                        }
                    })
                )
                .filter(item => {
                    return item;
                })
                .filter(item => {
                    if (item.id == "BTS") {
                        return true;
                    }
                    if (include) {
                        return include.includes(item.id);
                    }
                    return true;
                });
        });

        if (!(includeBTS === false)) {
            assets.push({id: "BTS", label: "BTS", gateway: ""});
        }

        this.setState({
            assets: assets
        });
    }

    getSelectedAssetArray(selectedAsset) {
        let {assets} = this.state;

        let asset;

        assets.map(a => {
            if (a.id == selectedAsset.split(".").shift()) {
                asset = a;
            }
        });

        return asset;
    }

    _onSelect(selectedAsset) {
        let {onSelect} = this.props;
        let asset = this.getSelectedAssetArray(selectedAsset);

        if (onSelect) {
            onSelect(asset);
        }
    }

    _onInputChanged(selectedAsset) {
        let {onChange} = this.props;
        let asset = this.getSelectedAssetArray(selectedAsset);

        if (onChange) {
            onChange(asset.id);
        }
    }

    render() {
        let {usageContext, placeholder} = this.props;

        let coinItems = this.state.assets.sort(function(a, b) {
            if (a.id && b.id) return a.id.localeCompare(b.id);
        });

        if (!placeholder) {
            placeholder = counterpart.translate(
                usageContext == "withdraw"
                    ? "gateway.asset_search_withdraw"
                    : "gateway.asset_search_deposit"
            );
        }

        return (
            <Select
                onSelect={this._onSelect.bind(this)}
                onChange={this._onInputChanged.bind(this)}
                onSearch={this._onInputChanged.bind(this)}
                placeholder={placeholder}
                defaultValue={this.props.defaultValue || undefined}
                value={this.props.value || undefined}
                optionLabelProp={"children"}
                showSearch
                style={{width: "100%"}}
                className="asset-selector"
                notFoundContent={counterpart.translate(
                    "cryptobridge.gateway.asset.not_found"
                )}
            >
                {/*
                    NOTE
                    On Deposit, it would be useful to view Min Deposit
                    and Gateway Fee to the right of the selection so the
                    user doesn't have to select a specific gateway to view
                    this information.
                */}
                {coinItems.map(coin => (
                    <Select.Option
                        key={coin.label}
                        className="asset-selector--option"
                    >
                        <AssetImage asset={coin.label} forceImage={true} />{" "}
                        {coin.label}{" "}
                        <span className="asset-selector--asset-name">
                            ({coin.name})
                        </span>
                    </Select.Option>
                ))}
            </Select>
        );
    }
}
DepositWithdrawAssetSelector = BindToChainState(DepositWithdrawAssetSelector);

export default connect(
    DepositWithdrawAssetSelector,
    {
        listenTo() {
            return [GatewayStore];
        },
        getProps() {
            return {
                backedCoins: GatewayStore.getState().backedCoins
            };
        }
    }
);
