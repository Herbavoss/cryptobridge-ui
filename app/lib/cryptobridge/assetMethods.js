export function getPaymentIdType(asset) {
    if (!asset) {
        return null;
    }

    switch (asset.backingCoinType) {
        case "XRP":
            return "tag";

        default:
            return "hash";
    }
}

export function getHasPaymentId(asset) {
    return asset && asset.withdrawalPaymentIdEnabled === true;
}

export function getIsValidPaymentId(asset, paymentId) {
    return (
        asset &&
        paymentId &&
        ((getPaymentIdType(asset) === "hash" &&
            /^([0-9a-fA-F]{16}|[0-9a-fA-F]{64})$/.test(paymentId)) ||
            (getPaymentIdType(asset) === "tag" && /^([0-9]+)$/.test(paymentId)))
    );
}

export function getIsCryptoBridgeAsset(asset) {
    if (!asset) {
        return false;
    }

    const symbol = typeof asset === "string" ? asset : asset.get("symbol");

    return /^BRIDGE\./i.test(symbol);
}

export function getCleanAssetSymbol(asset) {
    if (asset) {
        const symbol = typeof asset === "object" ? asset.get("symbol") : asset;
        return symbol.toUpperCase().replace(/^BRIDGE\./, "");
    }

    return "";
}

export function getRealAssetName(asset) {
    if (asset) {
        const symbol = typeof asset === "object" ? asset.get("symbol") : asset;

        const realAssetNames = {
            BRIM: "BR1M",
            SUBIX: "SUB1X",
            DV: "DV7",
            NLC: "NLC2",
            XDOGE: "DOGE",
            DOGE: "DOGE (DEPRECATED)"
        };

        if (realAssetNames[symbol]) {
            return realAssetNames[symbol];
        }

        return symbol;
    }

    return asset;
}

export function getCleanAssetPrice(price) {
    if (
        price &&
        !Number.isNaN(parseFloat(price)) &&
        price.toString().indexOf("e") !== -1
    ) {
        price = parseFloat(price).toFixed(8);
    }

    return price;
}
