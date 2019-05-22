import React from "react";
import Translate from "react-translate-component";

import {ChainStore} from "bitsharesjs";
import utils from "lib/common/utils";

import FormattedAsset from "components/Utility/FormattedAsset";
import CryptoBridgeWalletActions from "actions/cryptobridge/CryptoBridgeWalletActions";

export default class BridgeCoinStakingBalance extends React.Component {
    _onClaim(claimAll, e) {
        e.preventDefault();
        CryptoBridgeWalletActions.claimStakingBalance(
            this.props.account.get("id"),
            this.props.vb,
            claimAll
        ).then(() => {
            this.props.onChange();
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
