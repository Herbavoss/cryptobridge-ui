import React from "react";

import counterpart from "counterpart";

import {Tabs} from "bitshares-ui-style-guide";
import ReferralProgram from "./ReferralProgram";
import BridgeCoinStaking from "./BridgeCoinStaking/BridgeCoinStaking";
import TradingCompetition from "./TradingCompetition";

export default class Earn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: "referral",
                    link: "/earn/referral-program",
                    translate: "cryptobridge.earn.referral.title",
                    content: ReferralProgram
                },
                {
                    name: "staking",
                    link: "/earn/bridgecoin-staking",
                    translate: "cryptobridge.earn.staking.title",
                    content: BridgeCoinStaking
                },
                {
                    name: "competition",
                    link: "/earn/trading-competition",
                    translate: "cryptobridge.earn.competition.title",
                    content: TradingCompetition
                }
            ]
        };
    }

    render() {
        const onChange = value => {
            this.props.history.push(value);
        };

        return (
            <div className="grid-block page-layout">
                <div className={"grid-content no-padding"}>
                    <Tabs
                        activeKey={this.props.location.pathname}
                        defaultActiveTab={"referral"}
                        onChange={onChange}
                    >
                        {this.state.tabs.map(tab => {
                            const TabContent = tab.content;

                            return (
                                <Tabs.TabPane
                                    key={tab.link}
                                    tab={counterpart.translate(tab.translate)}
                                >
                                    <TabContent />
                                </Tabs.TabPane>
                            );
                        })}
                    </Tabs>
                </div>
            </div>
        );
    }
}
