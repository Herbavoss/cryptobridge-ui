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
            onUpdateMe: CryptoBridgeAccountActions.updateMe,
            onFetchRewards: CryptoBridgeAccountActions.fetchRewards,
            onClaimReward: CryptoBridgeAccountActions.claimReward
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
            me: null,
            rewards: []
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

    getRewards() {
        const {rewards} = this.state;

        if (this.getIsAuthenticated() && rewards) {
            return rewards;
        }

        return [];
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

    onFetchRewards(rewards) {
        this.setState({rewards: this.getIsAuthenticated() ? rewards : []});
    }

    onClaimReward({id}) {
        const rewards = this.getRewards();

        this.setState({
            rewards: rewards.filter(reward => reward.id !== id)
        });
    }
}

export default alt.createStore(
    CryptoBridgeAccountStore,
    "CryptoBridgeAccountStore"
);
