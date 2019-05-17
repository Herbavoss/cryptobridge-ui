import alt from "alt-instance";

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import {getBasicHeaders, getBasicToken} from "api/cryptobridge/apiHelpers";
import {cryptoBridgeAPIs} from "api/apiConfig";
import counterpart from "counterpart";

class CryptoBridgeAccountActions {
    login(account) {
        return dispatch => {
            if (CryptoBridgeAccountStore.getName() === account.get("name")) {
                return Promise.resolve(CryptoBridgeAccountStore.getAccess());
            }

            const basicToken = getBasicToken(account);

            if (!basicToken) {
                return Promise.reject("No user key available");
            }

            const options = {
                method: "POST",
                mode: "cors",
                headers: getBasicHeaders({}, {basicToken})
            };

            return fetch(`${cryptoBridgeAPIs.BASE_V2}/login`, options)
                .then(response => {
                    return response.json().then(access => {
                        if (response.ok) {
                            return access;
                        }

                        throw new Error(
                            access.message ||
                                counterpart.translate(
                                    "cryptobridge.account.login.error"
                                )
                        );
                    });
                })
                .then(access => {
                    dispatch(access);
                    return access;
                })
                .catch(e => {
                    dispatch({access: null});
                    throw new Error(e);
                });
        };
    }

    fetchMe() {
        return dispatch => {
            const options = {
                method: "GET",
                headers: getBasicHeaders()
            };

            return fetch(`${cryptoBridgeAPIs.BASE_V2}/accounts/me`, options)
                .then(response => {
                    return response.json().then(me => {
                        if (response.ok) {
                            return me;
                        }

                        throw new Error(
                            me.message ||
                                counterpart.translate(
                                    "cryptobridge.account.login.error"
                                )
                        );
                    });
                })
                .then(account => {
                    dispatch(account);
                    return account;
                })
                .catch(e => {
                    dispatch({});
                    throw new Error(e);
                });
        };
    }

    updateMe(me) {
        return dispatch => {
            const options = {
                method: "PUT",
                headers: getBasicHeaders(),
                body: JSON.stringify(me)
            };

            return fetch(`${cryptoBridgeAPIs.BASE_V2}/accounts/me`, options)
                .then(response => {
                    if (response.ok) {
                        return {};
                    }

                    throw new Error(
                        me.message ||
                            counterpart.translate(
                                "cryptobridge.account.update.error"
                            )
                    );
                })
                .then(me => {
                    dispatch(me);
                    return me;
                })
                .catch(e => {
                    dispatch({});
                    throw new Error(e);
                });
        };
    }

    logout() {
        return dispatch => {
            dispatch();
        };
    }
}

export default alt.createActions(CryptoBridgeAccountActions);
