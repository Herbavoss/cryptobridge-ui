import React from "react";

import Translate from "react-translate-component";
import FormattedAsset from "components/Utility/FormattedAsset";
import {ChainStore} from "bitsharesjs";
import utils from "common/utils";
import CryptoBridgeWalletActions from "actions/cryptobridge/CryptoBridgeWalletActions";
import {Apis} from "bitsharesjs-ws";
import AccountStakingCreate from "./AccountStakingCreate";
import {Button} from "bitshares-ui-style-guide";

class StakingBalance extends React.Component {
    _onClaim(claimAll, e) {
        e.preventDefault();
        CryptoBridgeWalletActions.claimStakingBalance(
            this.props.account.get("id"),
            this.props.vb,
            claimAll
        ).then(() => {
            typeof this.props.handleChanged == "function" &&
                this.props.handleChanged();
        });
    }

    render() {
        let {vb} = this.props;
        if (!this.props.vb) {
            return null;
        }

        let cvbAsset,
            available = false,
            daysLeft = 0,
            balance;
        if (vb) {
            balance = vb.balance.amount;
            cvbAsset = ChainStore.getAsset(vb.balance.asset_id);

            const claimStartDate = utils.timeStringToGrapheneDate(
                vb.policy[1].start_claim
            );
            const claimEndDate = new Date(
                claimStartDate.getTime() + vb.policy[1].vesting_seconds * 1000
            );

            if (new Date() >= claimEndDate) {
                available = true;
                daysLeft = 0;
            } else {
                daysLeft = parseInt(
                    claimEndDate.getTime() / 1000 - new Date().getTime() / 1000
                );
                daysLeft = (daysLeft / 86400).toFixed(2);
            }
        }

        if (!cvbAsset) {
            return null;
        }

        if (!balance) {
            return null;
        }

        return (
            <table className="table key-value-table">
                <tbody>
                    <tr>
                        <td>
                            <Translate content="cryptobridge.bridgecoin.amount" />
                        </td>
                        <td>
                            <FormattedAsset
                                amount={vb.balance.amount}
                                asset={vb.balance.asset_id}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {!available ? (
                                <Translate content="cryptobridge.bridgecoin.remaining" />
                            ) : null}
                        </td>
                        <td>
                            {daysLeft > 0 ? (
                                <Translate
                                    days={daysLeft}
                                    content="cryptobridge.bridgecoin.days"
                                />
                            ) : (
                                <Translate
                                    className="green"
                                    content="cryptobridge.bridgecoin.available"
                                />
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {!available ? (
                                <Translate content="cryptobridge.bridgecoin.status" />
                            ) : null}
                        </td>
                        <td style={{textAlign: "right"}}>
                            {available ? (
                                <Button
                                    onClick={this._onClaim.bind(this, true)}
                                    type="primary"
                                >
                                    <Translate content="account.member.claim" />
                                </Button>
                            ) : (
                                <Translate content="cryptobridge.bridgecoin.staking" />
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

class AccountStaking extends React.Component {
    constructor() {
        super();

        this.state = {
            vbs: null
        };
    }

    componentWillMount() {
        if (this.props.account) {
            this.retrieveStakingBalances.call(
                this,
                this.props.account.get("id")
            );
        }
    }

    componentWillUpdate(nextProps) {
        let newId = null;
        let oldId = null;

        if (nextProps.account) {
            newId = nextProps.account.get("id");
        }

        if (this.props.account) {
            oldId = this.props.account.get("id");
        }

        if (newId !== oldId) {
            this.retrieveStakingBalances.call(this, newId);
        }
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    retrieveStakingBalances(accountId) {
        accountId = accountId || this.props.account.get("id");
        Apis.instance()
            .db_api()
            .exec("get_vesting_balances", [accountId])
            .then(vbs => {
                if (!this.unmounted) {
                    this.setState({vbs});
                }
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    render() {
        const {vbs} = this.state;
        const {account} = this.props;
        if (
            !vbs ||
            !this.props.account ||
            !this.props.account.get("vesting_balances")
        ) {
            return null;
        }

        const vestingBalances = vbs.filter(
            vb => vb.balance.amount && vb.balance.asset_id === __BCO_ASSET_ID__
        );

        const balances = this.props.balances.map(balance => {
            return ChainStore.getObject(balance);
        });

        return (
            <div className="grid-block vertical">
                <div className="grid-container">
                    <div className="grid-content">
                        <AccountStakingCreate
                            account={this.props.account}
                            balances={balances}
                            gateFee={this.props.gateFee}
                        />

                        {!vestingBalances.length ? (
                            <h4 style={{paddingTop: "1rem"}}>
                                <Translate
                                    content={
                                        "cryptobridge.bridgecoin.no_balances"
                                    }
                                />
                            </h4>
                        ) : (
                            vestingBalances.map(vb => {
                                return (
                                    <StakingBalance
                                        key={vb.id}
                                        vb={vb}
                                        account={account}
                                        handleChanged={this.retrieveStakingBalances.bind(
                                            this
                                        )}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountStaking;
