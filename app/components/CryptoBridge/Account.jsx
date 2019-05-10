import React from "react";
import {connect} from "alt-react";

import {ChainStore} from "bitsharesjs/es";

import AccountStore from "stores/AccountStore";
import WalletUnlockStore from "stores/WalletUnlockStore";

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import CryptoBridgeAccountActions from "actions/cryptobridge/CryptoBridgeAccountActions";

class CryptoBridgeAccount extends React.Component {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.locked !== this.props.locked) {
            if (this.props.locked) {
                CryptoBridgeAccountActions.logout();
            } else {
                this.fetchOnAccount = true;
            }
        }

        if (this.props.account && this.fetchOnAccount) {
            this.fetchOnAccount = false;
            CryptoBridgeAccountActions.login(this.props.account);
        }

        if (
            prevProps.bearerToken !== this.props.bearerToken &&
            this.props.bearerToken &&
            this.props.account
        ) {
            CryptoBridgeAccountActions.me();
        }
    }

    render() {
        return null;
    }
}

export default connect(
    CryptoBridgeAccount,
    {
        listenTo() {
            return [AccountStore, CryptoBridgeAccountStore, WalletUnlockStore];
        },
        getProps() {
            const currentAccount =
                AccountStore.getState().currentAccount ||
                AccountStore.getState().passwordAccount;
            const account = ChainStore.getAccount(currentAccount, null);
            const bearerToken = CryptoBridgeAccountStore.getBearerToken();
            const locked = WalletUnlockStore.getState().locked;

            return {
                account,
                bearerToken,
                locked
            };
        }
    }
);
