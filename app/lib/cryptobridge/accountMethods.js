import {isPersistantType, setLocalStorageType} from "../common/localStorage";
import WalletUnlockActions from "actions/WalletUnlockActions";
import WalletDb from "stores/WalletDb";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletUnlockStore from "stores/WalletUnlockStore";

export function login() {
    if (WalletDb.isLocked()) {
        WalletUnlockActions.unlock()
            .then(() => {
                AccountActions.tryToSetCurrentAccount();
            })
            .catch(() => {});
    }
}

export function logout() {
    if (!WalletDb.isLocked()) {
        WalletUnlockActions.lock();
        if (!WalletUnlockStore.getState().rememberMe) {
            if (!isPersistantType()) {
                setLocalStorageType("persistant");
            }
            AccountActions.setPasswordAccount(null);
            AccountStore.tryToSetCurrentAccount();
        }
    }
}
