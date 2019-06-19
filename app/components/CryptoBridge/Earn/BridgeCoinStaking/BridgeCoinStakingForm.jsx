import React from "react";
import PropTypes from "prop-types";

import {debounce} from "lodash";

import utils from "common/utils";
import counterpart from "counterpart";

import {Asset} from "common/MarketClasses";
import BalanceComponent from "components/Utility/BalanceComponent";

import CryptoBridgeWalletActions from "actions/cryptobridge/CryptoBridgeWalletActions";

import Translate from "react-translate-component";

import {checkFeeStatusAsync, checkBalance} from "common/trxHelper";

import {
    Select,
    Button,
    Checkbox,
    Typography,
    Form
} from "bitshares-ui-style-guide";
const {Paragraph} = Typography;

import ExchangeInput from "components/Exchange/ExchangeInput";
import AssetName from "components/Utility/AssetName";

import LoginButton from "components/CryptoBridge/Global/LoginButton";

export class AccountStakingInfo {
    static stakingPeriods = [
        {
            name: "cryptobridge.earn.staking.month_1",
            name_plural: "cryptobridge.earn.staking.month_1_plural",
            bonus: "0%",
            value: 2678400
        },
        {
            name: "cryptobridge.earn.staking.month_3",
            name_plural: "cryptobridge.earn.staking.month_3_plural",
            bonus: "20%",
            value: 7776000
        },
        {
            name: "cryptobridge.earn.staking.month_6",
            name_plural: "cryptobridge.earn.staking.month_6_plural",
            bonus: "50%",
            value: 15552000
        },
        {
            name: "cryptobridge.earn.staking.month_12",
            name_plural: "cryptobridge.earn.staking.month_12_plural",
            bonus: "100%",
            value: 31536000
        }
    ];

    static getStakingPeriodByPeriodValue(value) {
        return this.stakingPeriods.find(
            period => period.value === parseInt(value)
        );
    }
}

export default class BridgeCoinStakingForm extends React.Component {
    static propTypes = {
        onReclaimFeeChange: PropTypes.func.isRequired
    };

    static defaultProps = {
        onReclaimFeeChange: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            feeStatus: {},
            asset:
                props.asset ||
                new Asset({
                    symbol: "BRIDGE.BCO",
                    asset_id: __BCO_ASSET_ID__,
                    precision: __BCO_ASSET_PRECISION__,
                    amount: 0
                }),
            stakingPeriodValue: 2678400,
            confirmationCheckboxChecked: false,
            showValidationErrors: false
        };

        this._checkFeeStatus = this._checkFeeStatus.bind(this);
        this._checkBalance = this._checkBalance.bind(this);
        this._getCurrentBalance = this._getCurrentBalance.bind(this);
        this._getFee = this._getFee.bind(this);
        this._onAmountChanged = this._onAmountChanged.bind(this);
        this._updateFee = debounce(this._updateFee.bind(this), 250);
    }

    componentDidMount() {
        this._updateFee();
        this._checkFeeStatus();
    }

    componentDidUpdate(prevProps) {
        if (
            JSON.stringify(this.props.account) !==
                JSON.stringify(prevProps.account) ||
            JSON.stringify(this.props.balances) !==
                JSON.stringify(prevProps.balances)
        ) {
            this.forceUpdate();
            this._updateFee();
            this._checkFeeStatus();
        }
    }

    _checkFeeStatus(account = this.props.account) {
        if (!account) return;

        const assets = ["1.3.0", this.state.asset.asset_id];
        let feeStatus = {};
        let p = [];
        assets.forEach(a => {
            p.push(
                checkFeeStatusAsync({
                    accountID: account.get("id"),
                    feeID: a,
                    type: "vesting_balance_create"
                })
            );
        });
        Promise.all(p)
            .then(status => {
                assets.forEach((a, idx) => {
                    feeStatus[a] = status[idx];
                });
                if (!utils.are_equal_shallow(this.state.feeStatus, feeStatus)) {
                    this.setState({
                        feeStatus
                    });
                }
                this._checkBalance();
            })
            .catch(err => {
                console.error(err);
            });
    }

    _updateFee() {
        if (!this.props.account) return null;
        checkFeeStatusAsync({
            accountID: this.props.account.get("id"),
            feeID: this.state.asset.asset_id,
            type: "vesting_balance_create"
        }).then(({fee, hasBalance, hasPoolBalance}) => {
            this.setState(
                {
                    feeAmount: fee,
                    hasBalance,
                    hasPoolBalance,
                    error: !hasBalance || !hasPoolBalance
                },
                () => {
                    this._checkFeeStatus();

                    const reclaimFee =
                        ((fee && fee.getAmount({real: true})) || 0) * 2;
                    this.props.onReclaimFeeChange(reclaimFee);
                }
            );
        });
    }

    _getCurrentBalance() {
        if (!this.props.balances) return null;

        return this.props.balances.find(b => {
            return b && b.get("asset_type") === this.state.asset.asset_id;
        });
    }

    _checkBalance() {
        const {feeAmount, asset} = this.state;
        const balance = this._getCurrentBalance();
        if (!balance || !feeAmount) return;
        const hasBalance = checkBalance(
            asset.getAmount({real: true}),
            asset,
            this._getFee(),
            balance,
            this._getGateFee()
        );
        if (hasBalance === null) return;
        if (this.state.balanceError !== !hasBalance)
            this.setState({balanceError: !hasBalance});

        return hasBalance;
    }

    _getFee() {
        const defaultFee = {
            getAmount: function() {
                return 0;
            },
            asset_id: this.state.asset.asset_id
        };

        if (!this.state.feeStatus || !this.state.feeAmount) return defaultFee;

        const coreStatus = this.state.feeStatus["1.3.0"];
        const withdrawAssetStatus = this.state.feeStatus[
            this.state.asset.asset_id
        ];
        // Use core asset to pay the fees if present and balance is sufficient since it's cheapest
        if (coreStatus && coreStatus.hasBalance) return coreStatus.fee;
        // Use same asset as withdraw if not
        if (
            coreStatus &&
            !coreStatus.hasBalance &&
            withdrawAssetStatus &&
            withdrawAssetStatus.hasBalance
        ) {
            return withdrawAssetStatus.fee;
        }
        return coreStatus ? coreStatus.fee : defaultFee;
    }

    _getGateFee() {
        const {gateFee} = this.props;
        const {asset} = this.state;
        return new Asset({
            real: parseFloat(gateFee ? gateFee.replace(",", "") : 0),
            asset_id: asset.asset_id,
            precision: asset.precision
        });
    }

    _onAmountChanged = e => {
        const {asset} = this.state;

        asset.setAmount({
            real: parseFloat(e.target.value)
        });

        this.setState({
            asset
        });
    };

    _setTotalStakeAmount = currentBalance => {
        const {feeAmount, asset} = this.state;

        const amount =
            currentBalance && feeAmount
                ? parseFloat(
                      currentBalance.get("balance") /
                          Math.pow(10, asset.precision) -
                          feeAmount.getAmount({real: true})
                  ).toFixed(asset.precision)
                : 0;

        asset.setAmount({
            real: parseFloat(amount)
        });

        this.setState({
            asset
        });
    };

    _setStakingPeriod = stakingPeriodValue => {
        this.setState({
            stakingPeriodValue: parseInt(stakingPeriodValue, 10)
        });
    };

    _stakeBalance = () => {
        if (!this.state.confirmationCheckboxChecked) {
            this.setState({
                showValidationErrors: true
            });
        } else {
            const {account} = this.props;
            const {asset, stakingPeriodValue} = this.state;

            CryptoBridgeWalletActions.stakeBalance(
                account.get("id"),
                stakingPeriodValue,
                asset.getAmount({real: true})
            );
        }
    };

    _onUnderstandCheckboxChange = () => {
        this.setState({
            confirmationCheckboxChecked: !this.state.confirmationCheckboxChecked
        });
    };

    render() {
        const {
            feeAmount,
            asset,
            showValidationErrors,
            stakingPeriodValue,
            confirmationCheckboxChecked
        } = this.state;

        const fee = (feeAmount && feeAmount.getAmount({real: true})) || 0;
        const reclaimFee =
            ((feeAmount && feeAmount.getAmount({real: true})) || 0) * 2;
        const currentBalance = this._getCurrentBalance();
        const amount = asset.getAmount({real: true}) || 0;

        if (!this.props.account) {
            return (
                <LoginButton
                    title={counterpart.translate(
                        "cryptobridge.earn.staking.login"
                    )}
                />
            );
        }

        const balance = (
            <div
                style={{
                    borderBottom: "#A09F9F 1px dotted",
                    cursor: "pointer",
                    float: "right",
                    fontSize: "0.8em",
                    marginTop: "5px"
                }}
                onClick={this._setTotalStakeAmount.bind(this, currentBalance)}
            >
                {" "}
                {currentBalance && currentBalance.get("balance") ? (
                    <Translate
                        content="cryptobridge.earn.staking.bco_available"
                        with={{
                            bco: (
                                <BalanceComponent
                                    balance={currentBalance.get("id")}
                                />
                            )
                        }}
                    />
                ) : (
                    <Translate content="cryptobridge.earn.staking.bco_not_available" />
                )}{" "}
            </div>
        );

        const stakingPeriod = AccountStakingInfo.getStakingPeriodByPeriodValue(
            stakingPeriodValue
        );

        return (
            <Form>
                <Paragraph>
                    <Translate
                        content="cryptobridge.earn.staking.intro_text_4"
                        with={{
                            fee,
                            reclaimFee
                        }}
                    />
                </Paragraph>

                <Translate
                    component="label"
                    className="left-label"
                    unsafe
                    content="cryptobridge.earn.staking.amount_bco"
                />
                <ExchangeInput
                    placeholder="0.0"
                    defaultValue={0}
                    value={amount}
                    onChange={this._onAmountChanged}
                    addonAfter={
                        <span>
                            <AssetName noTip name={"BRIDGE.BCO"} />
                        </span>
                    }
                />
                {balance}

                <Translate
                    component="label"
                    className="left-label"
                    style={{marginTop: "1rem"}}
                    content="cryptobridge.earn.staking.duration"
                />
                <Select
                    onChange={this._setStakingPeriod}
                    value={stakingPeriodValue}
                    style={{width: "100%"}}
                >
                    {AccountStakingInfo.stakingPeriods.map((p, i) => {
                        return (
                            <Select.Option
                                key={"stakingPeriod" + i}
                                value={p.value}
                            >
                                {counterpart.translate(p.name, {
                                    bonus: p.bonus
                                })}
                            </Select.Option>
                        );
                    })}
                </Select>

                {amount > 0 ? (
                    <label
                        style={{marginTop: "20px"}}
                        className={
                            showValidationErrors && !confirmationCheckboxChecked
                                ? "has-error"
                                : ""
                        }
                    >
                        <Checkbox
                            key={`checkbox_${confirmationCheckboxChecked}`} // This is needed to prevent slow checkbox reaction
                            onChange={this._onUnderstandCheckboxChange}
                            checked={confirmationCheckboxChecked}
                        >
                            <Translate
                                content="cryptobridge.earn.staking.understand"
                                with={{
                                    amount,
                                    month: counterpart(
                                        stakingPeriod.name_plural
                                    )
                                }}
                            />
                        </Checkbox>
                    </label>
                ) : null}

                <div
                    style={{
                        width: "100%",
                        textAlign: "right",
                        marginTop: "20px"
                    }}
                >
                    <Button
                        onClick={this._stakeBalance.bind(this)}
                        type="primary"
                        disabled={
                            showValidationErrors && !confirmationCheckboxChecked
                        }
                    >
                        <Translate content="cryptobridge.earn.staking.create" />
                    </Button>
                </div>
            </Form>
        );
    }
}
