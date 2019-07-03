import React from "react";
import Translate from "react-translate-component";
import utils from "common/utils";
import {requestDepositAddress, getDepositAddress} from "common/gatewayMethods";
import BlockTradesDepositAddressCache from "common/BlockTradesDepositAddressCache";
import CopyButton from "../Utility/CopyButton";
import Icon from "../Icon/Icon";
import LoadingIndicator from "../LoadingIndicator";
import {DecimalChecker} from "../Utility/DecimalChecker";
import DepositWithdrawAssetSelector from "../DepositWithdraw/DepositWithdrawAssetSelector.js";
import {
    gatewaySelector,
    _getNumberAvailableGateways,
    _onAssetSelected,
    _getCoinToGatewayMapping
} from "lib/common/assetGatewayMixin";
import {availableGateways, availableGatewaysAmount} from "common/gateways";
import {getGatewayStatusByAsset} from "common/gatewayUtils";
import CryptoLinkFormatter from "../Utility/CryptoLinkFormatter";
import counterpart from "counterpart";
import {Modal, Button, Tooltip} from "bitshares-ui-style-guide";

/* /CRYPTOBRIDGE */
import {connect} from "alt-react";
import AssetGatewayInfo from "components/Utility/CryptoBridge/AssetGatewayInfo";
import AssetGatewayInfoAccept from "components/Utility/CryptoBridge/AssetGatewayInfoAccept";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import LoginButton from "components/CryptoBridge/Global/LoginButton";
import ComplianceInfo from "components/CryptoBridge/Global/ComplianceInfo";
import {CryptoBridgeUser} from "../CryptoBridge/Account";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import {
    getCleanAssetSymbol,
    getRealAssetName
} from "lib/cryptobridge/assetMethods";
/* /CRYPTOBRIDGE */

class DepositModalContent extends DecimalChecker {
    constructor() {
        super();

        this.state = this._intitalState();

        this.deposit_address_cache = new BlockTradesDepositAddressCache();
        this.addDepositAddress = this.addDepositAddress.bind(this);
    }

    onClose() {
        this.props.hideModal();
    }

    componentWillMount() {
        let {asset} = this.props;
        this._setDepositAsset(asset);
    }

    componentDidMount() {
        if (
            this.props.authenticated &&
            this.props.requiresComplianceEnforcement
        ) {
            ZfApi.publish("check_required_account_actions");
        }
    }

    componentDidUpdate(prevProps) {
        const assetChanged = prevProps.asset !== this.props.asset;
        const authenticationChanged =
            prevProps.authenticated !== this.props.authenticated;
        const requiresComplianceEnforcementChanged =
            prevProps.requiresComplianceEnforcement !==
            this.props.requiresComplianceEnforcement;

        if (assetChanged || authenticationChanged) {
            this.setState(this._intitalState());
            this._setDepositAsset(this.props.asset);
        }

        if (
            this.props.authenticated &&
            this.props.requiresComplianceEnforcement &&
            (authenticationChanged || requiresComplianceEnforcementChanged)
        ) {
            ZfApi.publish("check_required_account_actions");
        }
    }

    onGatewayChanged(selectedGateway) {
        this._getDepositAddress(this.state.selectedAsset, selectedGateway);
    }

    onAssetSelected(asset) {
        this.setState({
            selectedAsset: asset.id,
            selectedGateway: null
        });

        if (asset.gateway == "") {
            return;
        }

        let {selectedAsset, selectedGateway} = _onAssetSelected.call(
            this,
            asset.id,
            "depositAllowed",
            (availableGateways, balancesByGateway) => {
                if (availableGateways && availableGateways.length == 1)
                    return availableGateways[0]; //autoselect gateway if exactly 1 item
                return null;
            }
        );

        if (selectedGateway) {
            this._getDepositAddress(selectedAsset, selectedGateway);
        }
    }

    _intitalState() {
        return {
            depositAddress: "",
            selectedAsset: "",
            selectedGateway: null,
            fetchingAddress: false,
            backingAsset: null,
            gatewayStatus: availableGateways
        };
    }

    _setDepositAsset(asset) {
        let coinToGatewayMapping = _getCoinToGatewayMapping.call(this);
        this.setState({coinToGatewayMapping});

        if (!asset) return;

        let backedAsset = asset.split(".");
        let usingGateway = this.state.gatewayStatus[backedAsset[0]]
            ? true
            : false;

        if (usingGateway) {
            let assetName = backedAsset[1];
            let assetGateway = backedAsset[0];
            this._getDepositAddress(assetName, assetGateway);
        } else {
            this.setState({selectedAsset: "BTS"});
        }
    }

    _getDepositObject(assetName, fullAssetName, selectedGateway, url) {
        let {props, state} = this;
        let {account} = props;
        let {gatewayStatus} = state;

        return {
            inputCoinType: gatewayStatus[selectedGateway].useFullAssetName
                ? fullAssetName.toLowerCase()
                : assetName.toLowerCase(),
            outputCoinType: fullAssetName.toLowerCase(),
            outputAddress: account,
            url: url,
            stateCallback: this.addDepositAddress,
            selectedGateway: selectedGateway
        };
    }

    _getDepositAddress(
        selectedAsset,
        selectedGateway,
        forceNewAddress = false
    ) {
        let {account} = this.props;
        let {gatewayStatus} = this.state;

        this.setState({
            fetchingAddress: true,
            depositAddress: null,
            gatewayStatus: getGatewayStatusByAsset.call(this, selectedAsset)
        });

        // Get Backing Asset for Gateway
        let backingAsset = this.props.backedCoins
            .get(selectedGateway.toUpperCase(), [])
            .find(c => {
                let backingCoin = c.backingCoinType || c.backingCoin;

                if (backingCoin.toUpperCase().indexOf("EOS.") !== -1) {
                    backingCoin = backingCoin.split(".")[1];
                }

                return (
                    backingCoin.toUpperCase() === selectedAsset.toUpperCase()
                );
            });

        if (!backingAsset) {
            console.log(selectedGateway + " does not support " + selectedAsset);
            this.setState({
                depositAddress: null,
                selectedAsset,
                selectedGateway,
                fetchingAddress: false
            });
            return;
        }

        let depositAddress;
        if (selectedGateway && selectedAsset && !forceNewAddress) {
            depositAddress = this.deposit_address_cache.getCachedInputAddress(
                selectedGateway.toLowerCase(),
                account,
                selectedAsset.toLowerCase(),
                selectedGateway.toLowerCase() +
                    "." +
                    selectedAsset.toLowerCase()
            );
        }

        if (!!gatewayStatus[selectedGateway].simpleAssetGateway) {
            this.setState({
                depositAddress: {
                    address: backingAsset.gatewayWallet,
                    memo: !gatewayStatus[selectedGateway].fixedMemo
                        ? account
                        : gatewayStatus[selectedGateway].fixedMemo["prepend"] +
                          account +
                          gatewayStatus[selectedGateway].fixedMemo["append"]
                },
                fetchingAddress: false
            });
        } else {
            if (!depositAddress) {
                const assetName =
                    backingAsset.backingCoinType || backingAsset.backingCoin;
                const fullAssetName = backingAsset.symbol;

                if (this.props.authenticated && this.props.account) {
                    const depositObject = this._getDepositObject(
                        assetName,
                        fullAssetName,
                        selectedGateway,
                        gatewayStatus[selectedGateway].baseAPI.BASE
                    );

                    if (forceNewAddress) {
                        console.log("force!");
                        requestDepositAddress(depositObject);
                    } else {
                        getDepositAddress({
                            coin: assetName,
                            account: this.props.account
                        })
                            .then(address => {
                                this.addDepositAddress(address);
                            })
                            .catch(() => {
                                requestDepositAddress(depositObject);
                            });
                    }
                }
            } else {
                this.setState({
                    depositAddress,
                    fetchingAddress: false
                });
            }
        }

        this.setState({
            selectedAsset,
            selectedGateway,
            backingAsset
        });
    }

    addDepositAddress(depositAddress) {
        let {selectedGateway, selectedAsset} = this.state;
        let {account} = this.props;

        this.deposit_address_cache.cacheInputAddress(
            selectedGateway.toLowerCase(),
            account,
            selectedAsset.toLowerCase(),
            selectedGateway.toLowerCase() + "." + selectedAsset.toLowerCase(),
            depositAddress.address,
            depositAddress.memo
        );
        this.setState({
            depositAddress,
            fetchingAddress: false
        });
    }

    generateNewDepositAddress() {
        const {selectedGateway, selectedAsset} = this.state;
        const forceNewAddress = true;

        if (selectedAsset && selectedGateway) {
            this._getDepositAddress(
                selectedAsset,
                selectedGateway,
                forceNewAddress
            );
        }
    }

    render() {
        let {
            selectedAsset,
            selectedGateway,
            depositAddress,
            fetchingAddress,
            gatewayStatus,
            backingAsset
        } = this.state;
        const {
            account,
            authenticated,
            requiresComplianceEnforcement,
            requiresTermsAndConditions,
            requiresUserVerification,
            backedCoins
        } = this.props;

        /* CRYPTOBRIDGE */
        let cbDepositAddress = depositAddress
            ? Object.assign({}, depositAddress)
            : null;

        if (!authenticated) {
            return (
                <LoginButton
                    title={counterpart.translate(
                        "cryptobridge.trade.deposit.login"
                    )}
                />
            );
        }
        if (requiresComplianceEnforcement) {
            return (
                <ComplianceInfo
                    requiresUserVerification={requiresUserVerification}
                    requiresTermsAndConditions={requiresTermsAndConditions}
                />
            );
        }

        let usingGateway = true;

        if (selectedGateway == null && selectedAsset == "BTS") {
            usingGateway = false;
            cbDepositAddress = {address: account};
        }

        /* CRYPTOBRIDGE */
        if (cbDepositAddress && typeof cbDepositAddress.address === "string") {
            const address = cbDepositAddress.address.split(":");
            cbDepositAddress.address = address[0];
            cbDepositAddress.tag = address[1] || null;
        }
        /* /CRYPTOBRIDGE */

        // Count available gateways
        let nAvailableGateways = _getNumberAvailableGateways.call(this);
        let isAddressValid =
            cbDepositAddress &&
            cbDepositAddress.address !== "unknown" &&
            !cbDepositAddress.error;

        let minDeposit = 0;
        if (!!backingAsset) {
            if (!!backingAsset.minAmount && !!backingAsset.precision) {
                minDeposit = utils.format_number(
                    backingAsset.minAmount /
                        utils.get_asset_precision(backingAsset.precision),
                    backingAsset.precision,
                    false
                );
            } else if (!!backingAsset.gateFee) {
                minDeposit = backingAsset.gateFee * 2;
            }
        }
        //let maxDeposit = backingAsset.maxAmount ? backingAsset.maxAmount : null;

        const QR = isAddressValid ? (
            <CryptoLinkFormatter
                size={140}
                address={usingGateway ? cbDepositAddress.address : account}
                asset={selectedAsset}
            />
        ) : (
            <div>
                <Icon
                    size="5x"
                    name="minus-circle"
                    title="icons.minus_circle.wrong_address"
                />
                <p className="error-msg">
                    <Translate content="modal.deposit.address_generation_error" />
                </p>
            </div>
        );

        /* CRYPTOBRDGE */
        let selectedAssetBackedCoin;

        if (selectedAsset && backedCoins && backedCoins.get("BRIDGE")) {
            selectedAssetBackedCoin = backedCoins
                .get("BRIDGE")
                .find(backedCoin => {
                    return backedCoin.backingCoinType === selectedAsset;
                });
        }

        const assetGatewayInfo = selectedAssetBackedCoin ? (
            <AssetGatewayInfo
                asset={selectedAssetBackedCoin}
                filter={"deposit"}
                minDeposit={minDeposit}
            />
        ) : null;
        /* /CRYPTOBRIDGE */

        return (
            <div className="grid-block vertical no-overflow">
                <div className="modal__body" style={{paddingTop: "0"}}>
                    <div className="container-row">
                        <div className="no-margin no-padding">
                            <label className="left-label">
                                <Translate content="gateway.asset_to_deposit" />
                            </label>
                            <div className="inline-label input-wrapper">
                                <DepositWithdrawAssetSelector
                                    defaultValue={this.state.selectedAsset}
                                    value={this.state.selectedAsset}
                                    onSelect={this.onAssetSelected.bind(this)}
                                    selectOnBlur
                                />
                            </div>
                        </div>
                    </div>

                    {availableGatewaysAmount > 1 &&
                    usingGateway &&
                    selectedAsset // ONLY CB IS SELECTED
                        ? gatewaySelector.call(this, {
                              selectedGateway,
                              gatewayStatus,
                              nAvailableGateways,
                              error: cbDepositAddress && cbDepositAddress.error,
                              onGatewayChanged: this.onGatewayChanged.bind(this)
                          })
                        : null}

                    {fetchingAddress ? (
                        <div
                            className="container-row"
                            style={{textAlign: "center", paddingTop: 15}}
                        >
                            <LoadingIndicator type="three-bounce" />
                        </div>
                    ) : null}
                    {selectedGateway &&
                    gatewayStatus[selectedGateway].options.enabled &&
                    isAddressValid ? (
                        <AssetGatewayInfoAccept
                            asset={getCleanAssetSymbol(backingAsset.symbol)}
                            name={backingAsset.name}
                            tag={cbDepositAddress.tag ? true : false}
                        >
                            {!fetchingAddress ? (
                                (!usingGateway ||
                                    (usingGateway &&
                                        selectedGateway &&
                                        gatewayStatus[selectedGateway].options
                                            .enabled)) &&
                                isAddressValid &&
                                !cbDepositAddress.memo ? (
                                    <div
                                        className="container-row"
                                        style={{textAlign: "center"}}
                                    >
                                        {QR}
                                    </div>
                                ) : null
                            ) : null}
                            <div className="container-row">
                                <div className="grid-block container-row">
                                    <div style={{paddingRight: "1rem"}}>
                                        <CopyButton
                                            text={cbDepositAddress.address}
                                            className={"copyIcon"}
                                        />
                                    </div>
                                    <div style={{wordBreak: "break-word"}}>
                                        <Translate
                                            component="div"
                                            style={{
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                paddingBottom: "0.3rem"
                                            }}
                                            content="cryptobridge.gateway.deposit.address.notice"
                                            asset={getRealAssetName(
                                                selectedAsset
                                            )}
                                        />
                                        <div
                                            className="modal__highlight"
                                            style={{
                                                fontSize: "0.9rem",
                                                wordBreak: "break-all"
                                            }}
                                        >
                                            {cbDepositAddress.address}
                                            <Tooltip
                                                title={counterpart.translate(
                                                    "cryptobridge.gateway.deposit.address.new"
                                                )}
                                            >
                                                <Button
                                                    onClick={() => {
                                                        this.generateNewDepositAddress();
                                                    }}
                                                    icon={"sync"}
                                                    size={"small"}
                                                    style={{marginLeft: "1rem"}}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                {/* CRYPTOBRIDGE */}
                                {cbDepositAddress.tag && (
                                    <div className="grid-block container-row">
                                        <div style={{paddingRight: "1rem"}}>
                                            <CopyButton
                                                text={cbDepositAddress.tag}
                                                className={"copyIcon"}
                                            />
                                        </div>
                                        <div>
                                            <Translate
                                                component="div"
                                                style={{
                                                    fontSize: "0.8rem",
                                                    fontWeight: "bold",
                                                    paddingBottom: "0.3rem"
                                                }}
                                                unsafe
                                                content="cryptobridge.gateway.deposit.tag.notice"
                                            />
                                            <div
                                                className="modal__highlight"
                                                style={{wordBreak: "break-all"}}
                                            >
                                                {cbDepositAddress.tag}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* /CRYPTOBRIDGE */}
                                {cbDepositAddress.memo ? (
                                    <div className="grid-block container-row">
                                        <div style={{paddingRight: "1rem"}}>
                                            <CopyButton
                                                text={cbDepositAddress.memo}
                                                className={"copyIcon"}
                                            />
                                        </div>
                                        <div>
                                            <Translate
                                                component="div"
                                                style={{
                                                    fontSize: "0.8rem",
                                                    fontWeight: "bold",
                                                    paddingBottom: "0.3rem"
                                                }}
                                                unsafe
                                                content="gateway.purchase_notice_memo"
                                            />
                                            <div
                                                className="modal__highlight"
                                                style={{wordBreak: "break-all"}}
                                            >
                                                {cbDepositAddress.memo}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                                {assetGatewayInfo}
                            </div>
                        </AssetGatewayInfoAccept>
                    ) : (
                        assetGatewayInfo
                    )}
                    {!usingGateway ? (
                        <div className="container-row deposit-directly">
                            <h2
                                className="modal__highlight"
                                style={{textAlign: "center"}}
                            >
                                {account}
                            </h2>
                            <Translate
                                component="h6"
                                content="modal.deposit.bts_transfer_description"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

DepositModalContent = connect(
    DepositModalContent,
    {
        listenTo() {
            return [CryptoBridgeAccountStore];
        },
        getProps() {
            const authenticated = CryptoBridgeAccountStore.getIsAuthenticated();
            const me = new CryptoBridgeUser(
                CryptoBridgeAccountStore.getState()
            );
            const requiresComplianceEnforcement = me.getRequiresComplianceEnforcement();

            return {
                authenticated,
                requiresComplianceEnforcement,
                requiresTermsAndConditions: me.getRequiresTermsAndConditions(),
                requiresUserVerification: me.getRequiresUserVerification()
            };
        }
    }
);

export default class DepositModal extends React.Component {
    constructor() {
        super();

        this.state = {open: false};
    }

    show() {
        this.setState({open: true}, () => {
            this.props.hideModal();
        });
    }

    onClose() {
        this.props.hideModal();
        this.setState({open: false});
    }

    render() {
        return (
            <Modal
                title={
                    this.props.account
                        ? counterpart.translate("modal.deposit.header", {
                              account_name: this.props.account
                          })
                        : counterpart.translate("modal.deposit.header_short")
                }
                id={this.props.modalId}
                className={this.props.modalId}
                onCancel={this.onClose.bind(this)}
                overlay={true}
                footer={[
                    <Button key="cancel" onClick={this.props.hideModal}>
                        {counterpart.translate("modal.close")}
                    </Button>
                ]}
                visible={this.props.visible}
                noCloseBtn
            >
                <DepositModalContent
                    hideModal={this.props.hideModal}
                    {...this.props}
                    open={this.props.visible}
                />
            </Modal>
        );
    }
}
