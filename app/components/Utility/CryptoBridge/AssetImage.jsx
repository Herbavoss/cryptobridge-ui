import React from "react";
import PropTypes from "prop-types";

class AssetImage extends React.Component {
    static propTypes = {
        asset: PropTypes.string.isRequired
    };

    static defaultProps = {
        asset: ""
    };

    render() {
        const {asset} = this.props;

        const style = {
            verticalAlign: "middle"
        };

        const assetName = asset.replace(/^bridge\./i, "").toLowerCase();

        return (
            <img
                className={"asset-image"}
                src={`${__WALLET_URL_PROD__}/assets/${assetName}.png`}
                style={style}
            />
        );
    }
}

export default AssetImage;
