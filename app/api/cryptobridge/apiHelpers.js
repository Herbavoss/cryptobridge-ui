import {Aes} from "bitsharesjs/es";
import {PublicKey} from "bitsharesjs";
import WalletDb from "stores/WalletDb";

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";

export const signMemoWithKeys = (
    senderPrivateKey,
    recipientPublicKey,
    nonce,
    memo
) => {
    try {
        return Aes.encrypt_with_checksum(
            senderPrivateKey,
            recipientPublicKey,
            nonce,
            Buffer.from(memo)
        ).toString("hex");
    } catch (error) {
        console.log(`AccountUtils:signMemoWithKeys() - ${error}`);
    }
};

export const getAuthKey = account => {
    if (!account || WalletDb.isLocked()) {
        return null;
    }

    const memoPublicKeyStr = account.getIn(["options", "memo_key"]);
    const memoPrivateKey = WalletDb.getPrivateKey(memoPublicKeyStr);

    const activePublicKeyStr = account
        .get("active")
        .get("key_auths")
        .get(0)
        .get(0);
    const activePrivateKey = WalletDb.getPrivateKey(activePublicKeyStr);

    const ownerPublicKeyStr = account
        .get("owner")
        .get("key_auths")
        .get(0)
        .get(0);
    const ownerPrivateKey = WalletDb.getPrivateKey(ownerPublicKeyStr);

    const key = memoPrivateKey || activePrivateKey || ownerPrivateKey;

    if (!key) {
        return null;
    }

    return key;
};

export const getBasicToken = account => {
    const key = getAuthKey(account);

    if (!key) {
        return null;
    }

    const recipientPublicKey = PublicKey.fromPublicKeyString(
        __CRYPTOBRIDGE_PUB_KEY__
    );

    const username = account.get("name");
    const nonce = 1;
    const password = signMemoWithKeys(
        key,
        recipientPublicKey,
        nonce,
        JSON.stringify({user: username, ts: Date.now()})
    );

    return btoa(username + ":" + password);
};

export const getBasicHeaders = (headers, options = {}) => {
    headers = Object.assign(
        {
            Accept: "application/json",
            "Content-Type": "application/json",
            "App-Version": APP_VERSION,
            "App-Platform": __ELECTRON__ ? "electron" : "web"
        },
        headers || {}
    );

    const bearerToken =
        options.bearerToken || CryptoBridgeAccountStore.getBearerToken();

    if (bearerToken) {
        headers.Authorization = `Bearer ${bearerToken}`;
    }

    if (options.basicToken) {
        headers.Authorization = `Basic ${options.basicToken}`;
    }

    if (options.reCaptchaToken) {
        headers.Recaptcha = options.reCaptchaToken;
    }

    return headers;
};
