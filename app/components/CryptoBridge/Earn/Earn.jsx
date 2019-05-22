import React from "react";

import counterpart from "counterpart";

import {Tabs} from "bitshares-ui-style-guide";
import ReferralProgram from "./ReferralProgram";
import BridgeCoinStaking from "./BridgeCoinStaking/BridgeCoinStaking";

export default class Earn extends React.Component {
    render() {
        return (
            <Tabs defaultActiveKey={"referral"}>
                <Tabs.TabPane
                    tab={counterpart.translate(
                        "cryptobridge.earn.referral.title"
                    )}
                    key="referral"
                >
                    <ReferralProgram />
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={counterpart.translate(
                        "cryptobridge.earn.staking.title"
                    )}
                    key="staking"
                >
                    <BridgeCoinStaking />
                </Tabs.TabPane>
            </Tabs>
        );
    }
}
