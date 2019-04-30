import React from "react";
import ReactDOM from "react-dom";
import AppInit from "./AppInit";

/* CRYPTOBRIDGE */
import {ChainConfig} from "bitsharesjs-ws";
ChainConfig.networks.CryptoBridgeTest = {
    core_asset: "BTS",
    address_prefix: "BTS",
    chain_id: __CHAIN_ID_TEST__
};
/* ADD CRYPTOBRIDGE LOCAL TO CHAIN CONFIG */
ChainConfig.networks.CryptoBridgeLocal = {
    core_asset: "BTS",
    address_prefix: "BTS",
    chain_id: __CHAIN_ID_LOCAL__
};
/* /CRYPTOBRIDGE */

if (__PERFORMANCE_DEVTOOL__) {
    const {registerObserver} = require("react-perf-devtool");
    registerObserver();
}

const rootEl = document.getElementById("content");
const render = () => {
    ReactDOM.render(<AppInit />, rootEl);
};
render();
