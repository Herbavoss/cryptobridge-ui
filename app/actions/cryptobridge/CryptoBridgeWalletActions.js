import alt from "alt-instance";

import WalletDb from "stores/WalletDb";
import {TransactionBuilder} from "bitsharesjs/es";

class CryptoBridgeWalletActions {
    stakeBalance(account, period, amount) {
        let tr = new TransactionBuilder();

        tr.add_type_operation("vesting_balance_create", {
            fee: {amount: "0", asset_id: __BCO_ASSET_ID__},
            creator: account,
            owner: account,
            amount: {
                amount: amount * Math.pow(10, 7),
                asset_id: __BCO_ASSET_ID__
            },
            policy: [
                1,
                {
                    start_claim: new Date().toISOString().slice(0, 19),
                    vesting_seconds: period
                }
            ]
        });

        return WalletDb.process_transaction(tr, null, true)
            .then(result => {})
            .catch(err => {
                console.log("vesting_balance_create err:", err);
            });
    }

    claimStakingBalance(account, cvb) {
        let tr = new TransactionBuilder();

        const balance = cvb.balance.amount;

        tr.add_type_operation("vesting_balance_withdraw", {
            fee: {amount: "0", asset_id: __BCO_ASSET_ID__},
            owner: account,
            vesting_balance: cvb.id,
            amount: {
                amount: Math.floor(balance),
                asset_id: cvb.balance.asset_id
            }
        });

        return WalletDb.process_transaction(tr, null, true)
            .then(result => {})
            .catch(err => {
                console.log("vesting_balance_withdraw err:", err);
            });
    }
}

export default alt.createActions(CryptoBridgeWalletActions);
