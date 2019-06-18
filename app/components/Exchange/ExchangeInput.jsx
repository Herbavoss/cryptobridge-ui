import React from "react";
import {Input} from "bitshares-ui-style-guide";
import {DecimalChecker} from "../Utility/DecimalChecker";
import {getCleanAssetPrice} from "lib/cryptobridge/assetMethods";

class ExchangeInput extends DecimalChecker {
    constructor() {
        super();
    }

    componentWillReceiveProps(np) {
        if (this.props.value && !np.value) {
            this.refs.input.value = "";
        }
    }

    render() {
        // allowNaN is no valid prop for Input, remove
        var {allowNaN, ...other} = this.props;

        if (other.value) {
            other.value = getCleanAssetPrice(other.value);
        }

        return (
            <Input
                ref="input"
                type="text"
                {...other}
                onPaste={this.props.onPaste || this.onPaste.bind(this)}
                onKeyPress={this.onKeyPress.bind(this)}
            />
        );
    }
}

export default ExchangeInput;
