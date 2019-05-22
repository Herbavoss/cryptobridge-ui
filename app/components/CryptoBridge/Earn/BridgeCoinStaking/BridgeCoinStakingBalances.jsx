import React from "react";
import BridgeCoinStakingBalance from "./BridgeCoinStakingBalance";
import {Typography} from "bitshares-ui-style-guide";
const {Title} = Typography;
import Translate from "react-translate-component";

export default class BridgeCoinStakingBalances extends React.Component {
    render() {
        const {balances, account} = this.props;

        if (!account) {
            return null;
        }

        if (!balances.length) {
            return (
                <Title level={4}>
                    <Translate content="cryptobridge.earn.staking.no_balances" />
                </Title>
            );
        }

        return balances.map(vb => {
            return (
                <BridgeCoinStakingBalance
                    key={vb.id}
                    vb={vb}
                    account={account}
                    onChange={this.props.onChange}
                />
            );
        });
    }
}
