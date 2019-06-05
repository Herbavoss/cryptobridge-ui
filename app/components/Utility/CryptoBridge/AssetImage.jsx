import React from "react";
import PropTypes from "prop-types";
import {
    getCleanAssetSymbol,
    getIsCryptoBridgeAsset
} from "lib/cryptobridge/assetMethods";

class AssetImage extends React.Component {
    static propTypes = {
        asset: PropTypes.string.isRequired,
        forceImage: PropTypes.bool.isRequired
    };

    static defaultProps = {
        asset: "",
        forceImage: false
    };

    render() {
        const {asset, forceImage} = this.props;

        const style = {
            verticalAlign: "middle"
        };

        const hasAssetImage = getIsCryptoBridgeAsset(asset) || asset === "BTS";
        const assetName = getCleanAssetSymbol(asset).toLowerCase();

        const src =
            hasAssetImage || forceImage
                ? `${__WALLET_URL_PROD__}/assets/${assetName}.png`
                : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        return <img className={"asset-image"} src={src} style={style} />;
    }
}

export default AssetImage;
