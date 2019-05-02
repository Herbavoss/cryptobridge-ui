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
