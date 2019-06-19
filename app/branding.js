/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "CryptoBridge";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "https://wallet.crypto-bridge.org";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url: __FAUCET_URL__, // CRYPTOBRIDGE FAUCET
        show: true,
        editable: false
    };
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
export function getLogo() {
    return `${__BASE_URL__}cryptobridge/cryptobridge-logo.svg`;
}

/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
    // possible ["darkTheme", "lightTheme", "midnightTheme"]
    return "darkTheme";
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
    // possible: one of "password", "wallet"
    return "password";
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits(chainId = __CHAIN_ID_SHORT__) {
    if (chainId === __CHAIN_ID_MAIN__.substr(0, 8))
        // MAIN
        return ["BTC", "BTS"];
    else if (chainId === __CHAIN_ID_TEST__.substr(0, 8)) return ["BTC", "BTS"];
    // TEST
    else if (chainId === __CHAIN_ID_LOCAL__.substr(0, 8)) return ["BTC", "BTS"];
    // LOCAL
    // unknown chain id: (need to return at least one unit)
    else return ["BTS"];
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */

export function getMyMarketsBases() {
    return [
        "BRIDGE.BTC",
        "BRIDGE.USDT",
        "BRIDGE.ETH",
        "BRIDGE.LTC",
        "BRIDGE.RVN",
        "BTS"
    ];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes() {
    let tokens = {
        nativeTokens: ["BTS"],
        bridgeTokens: [
            "BRIDGE.BCO",
            "BRIDGE.BTC",
            "BRIDGE.ETH",
            "BRIDGE.LTC",
            "BRIDGE.USDT",
            "BRIDGE.RVN",
            "BRIDGE.XRP",
            "BRIDGE.BCH",
            "BRIDGE.XMR",
            "BRIDGE.ZEC",
            "BRIDGE.MONA",
            "BRIDGE.SMART",
            "BRIDGE.ZNY",
            "BRIDGE.XP",
            "BRIDGE.DOGE",
            "BRIDGE.SHND"
        ]
    };

    let allTokens = [];
    for (let type in tokens) {
        allTokens = allTokens.concat(tokens[type]);
    }
    return allTokens;
}

/**
 * The core asset
 *
 * @returns {string}
 */

export function getMyCoreAsset() {
    return "BTS";
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
    return [["BRIDGE.BTC", "BRIDGE.BCO"]].filter(a => {
        if (!quotes.length) return true;
        return quotes.indexOf(a[0]) !== -1;
    });
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
    return ["BRIDGE."];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for BitAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "OPEN.", "bit"
    return [];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    return ["BRIDGE"].indexOf(gateway) >= 0;
}

export function getSupportedLanguages() {
    // not yet supported
}

export function getAllowedLogins() {
    // possible: list containing any combination of ["password", "wallet"]
    return ["password", "wallet"];
}
