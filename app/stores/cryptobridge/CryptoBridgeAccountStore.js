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
            onFetchMe: CryptoBridgeAccountActions.fetchMe,
            onUpdateMe: CryptoBridgeAccountActions.updateMe
        });

        this._export(
            "getName",
            "getAccess",
            "getMe",
            "getBearerToken",
            "getIsAuthenticated"
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

    onFetchMe(me) {
        this.setState({me});
    }

    onUpdateMe() {}

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
