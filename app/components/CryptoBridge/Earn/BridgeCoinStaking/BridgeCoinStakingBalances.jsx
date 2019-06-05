import React from "react";
import {Typography, List, Button} from "bitshares-ui-style-guide";
const {Title} = Typography;
import Translate from "react-translate-component";
import utils from "lib/common/utils";
import CryptoBridgeWalletActions from "actions/cryptobridge/CryptoBridgeWalletActions";
import FormattedAsset from "components/Utility/FormattedAsset";

export default class BridgeCoinStakingBalances extends React.Component {
    componentDidUpdate(prevProps) {
        if (
            JSON.stringify(prevProps.balances) !==
            JSON.stringify(this.props.balances)
        ) {
            this.forceUpdate();
        }
    }

    claim(vb) {
        const {account} = this.props;

        if (account) {
            CryptoBridgeWalletActions.claimStakingBalance(
                account.get("id"),
                vb,
                true
            ).then(() => {
                this.props.onChange();
            });
        }
    }

    renderItem = vb => {
        let available = false,
            daysLeft = 0;

        const claimStartDate = utils.timeStringToGrapheneDate(
            vb.policy[1].start_claim
        );
        const claimEndDate = new Date(
            claimStartDate.getTime() + vb.policy[1].vesting_seconds * 1000
        );

        if (new Date() >= claimEndDate) {
            available = true;
            daysLeft = 0;
        } else {
            daysLeft = parseInt(
                claimEndDate.getTime() / 1000 - new Date().getTime() / 1000
            );
            daysLeft = (daysLeft / 86400).toFixed(2);
        }

        const action = available ? (
            <Button
                onClick={() => {
                    this.claim(vb);
                }}
                type="primary"
            >
                <Translate content="account.member.claim" />
            </Button>
        ) : (
            <Translate content="cryptobridge.earn.staking.staking" />
        );

        return (
            <List.Item actions={[action]}>
                <List.Item.Meta
                    title={
                        <Translate content="cryptobridge.earn.staking.amount" />
                    }
                    description={
                        <FormattedAsset
                            amount={vb.balance.amount}
                            asset={vb.balance.asset_id}
                        />
                    }
                />
                <div>
                    {!available ? (
                        <Translate content="cryptobridge.earn.staking.remaining" />
                    ) : null}
                    {daysLeft > 0 ? (
                        <Translate
                            days={daysLeft}
                            content="cryptobridge.earn.staking.days"
                        />
                    ) : (
                        <Translate
                            className="green"
                            content="cryptobridge.earn.staking.available"
                        />
                    )}
                </div>
            </List.Item>
        );
    };

    render() {
        const {balances, account} = this.props;

        if (!account) {
            return null;
        }

        if (!balances.length) {
            return (
                <Title level={4}>
                    <Translate content="cryptobridge.earn.staking.no_positions" />
                </Title>
            );
        }

        return (
            <div>
                <Title level={4}>
                    <Translate content="cryptobridge.earn.staking.positions" />
                </Title>
                <List dataSource={balances} renderItem={this.renderItem} />
            </div>
        );
    }
}
