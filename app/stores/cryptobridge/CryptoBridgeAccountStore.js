import BaseStore from "stores/BaseStore";
import alt from "alt-instance";
import CryptoBridgeAccountActions from "actions/cryptobridge/CryptoBridgeAccountActions";

class CryptoBridgeAccountStore extends BaseStore {
    constructor() {
        super();

        this.state = this._getInitialState();

        this.bindListeners({
            onLogin: CryptoBridgeAccountActions.login,
            onLogout: CryptoBridgeAccountActions.logout,
            onMe: CryptoBridgeAccountActions.me
        });

        this._export(
            "getName",
            "getAccess",
            "getMe",
            "getBearerToken",
            "getIsAuthenticated",
            "getRequiresUserIdentification",
            "getRequiresTermsAndConditions"
        );
    }

    _getInitialState() {
        return {
            access: null,
            me: null
        };
    }

    getName() {
        const me = this.getMe();

        if (!me) {
            return null;
        }

        return me.name;
    }

    getBearerToken() {
        const access = this.getAccess();

        if (!access) {
            return null;
        }

        return access.access_token;
    }

    getAccess() {
        return this.state.access;
    }

    getMe() {
        return this.state.me;
    }

    getIsAuthenticated() {
        return this.getMe() !== null;
    }

    getRequiresUserIdentification() {
        const {kyc} = this.getMe() || {};

        if (!kyc) {
            return null;
        }

        return kyc.required !== false;
    }

    getRequiresTermsAndConditions() {
        const {terms} = this.getMe() || {};

        if (!terms) {
            return null;
        }

        return terms.status !== "complete";
    }

    getUserIdentificationIsPending() {
        return (
            this.getRequiresUserIdentification() &&
            this.getMe().kyc.status === "pending"
        );
    }

    onMe(me) {
        this.setState({me});
    }

    onLogin(access) {
        this.setState({access});
    }

    onLogout() {
        this.setState(this._getInitialState());
    }
}

export default alt.createStore(
    CryptoBridgeAccountStore,
    "CryptoBridgeAccountStore"
);
