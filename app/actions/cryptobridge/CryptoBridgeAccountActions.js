import alt from "alt-instance";

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import {getBasicHeaders, getBasicToken} from "api/cryptobridge/apiHelpers";
import {cryptoBridgeAPIs} from "api/apiConfig";

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
                    if (response.ok) {
                        return response.json();
                    }

                    throw new Error("Auth basic error");
                })
                .then(access => {
                    dispatch(access);
                    return access;
                })
                .catch(() => {
                    dispatch({access: null});
                });
        };
    }

    me() {
        return dispatch => {
            const options = {
                method: "GET",
                headers: getBasicHeaders()
            };

            return fetch(`${cryptoBridgeAPIs.BASE_V2}/accounts/me`, options)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }

                    throw new Error("Auth bearer error");
                })
                .then(response => response.json())
                .then(account => {
                    dispatch(account);
                    return account;
                })
                .catch(err => {
                    dispatch({});
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
