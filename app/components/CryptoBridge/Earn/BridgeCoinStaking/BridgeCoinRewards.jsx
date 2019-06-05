import React from "react";
import {connect} from "alt-react";

import Translate from "react-translate-component";
import counterpart from "counterpart";

import {
    Typography,
    List,
    Alert,
    Button,
    message
} from "bitshares-ui-style-guide";
const {Paragraph, Title} = Typography;
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import {CryptoBridgeUser} from "../../Account";
import CryptoBridgeAccountActions from "actions/cryptobridge/CryptoBridgeAccountActions";

class BridgeCoinRewards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rewardClaimInProgress: null
        };
    }

    claimReward(id, type) {
        this.setState({rewardClaimInProgress: `${id}_${type}`});

        CryptoBridgeAccountActions.claimReward(id, type)
            .then(() => {
                this.setState({
                    rewardClaimInProgress: null
                });
                message.success(
                    counterpart.translate(
                        "cryptobridge.account.rewards.claim.success"
                    )
                );
            })
            .catch(e => {
                this.setState({
                    rewardClaimInProgress: null
                });
                message.error(
                    e.message ||
                        counterpart.translate(
                            "cryptobridge.account.rewards.claim.error"
                        )
                );
            });
    }

    render() {
        const {me, reclaimFee} = this.props;

        const rewards = me.getRewards();

        if (
            !rewards ||
            !rewards.length ||
            !reclaimFee ||
            !me.getIsAuthenticated()
        ) {
            return null;
        }

        const {rewardClaimInProgress} = this.state;

        const actionButton = (id, type) => {
            return (
                <Button
                    type={type === "stake" ? "primary" : undefined}
                    size={"large"}
                    onClick={() => {
                        this.claimReward(id, type);
                    }}
                    disabled={rewardClaimInProgress !== null}
                    loading={rewardClaimInProgress === `${id}_${type}`}
                >
                    <Translate
                        content={`cryptobridge.earn.staking.rewards.button.${type}`}
                    />
                    <br />
                    <span
                        style={{
                            display: "block",
                            fontSize: "10px",
                            marginTop: "-3px"
                        }}
                    >
                        (
                        <Translate
                            content={`cryptobridge.earn.staking.rewards.button.${type}_bonus`}
                            with={{percent: 10}}
                        />
                        )
                    </span>
                </Button>
            );
        };

        const renderReward = reward => {
            const actions = [
                actionButton(reward.id, "claim"),
                actionButton(reward.id, "stake")
            ];

            const title = `${reward.from.substr(0, 10)} - ${reward.to.substr(
                0,
                10
            )}`;
            const description = `${counterpart.translate(
                "cryptobridge.earn.staking.rewards.reward.usd"
            )} ${reward.amount}`;
            const content = `${counterpart.translate(
                "cryptobridge.earn.staking.rewards.reward.payout"
            )} ${reward.payout} BCO (@ ${reward.price} BCO/USD)`;

            return (
                <List.Item actions={actions}>
                    <List.Item.Meta title={title} description={description} />
                    <div>{content}</div>
                </List.Item>
            );
        };

        return (
            <div>
                <Title level={4}>
                    <Translate
                        content={"cryptobridge.earn.staking.rewards.title"}
                    />
                </Title>
                <Paragraph>
                    <Translate
                        content={
                            "cryptobridge.earn.staking.rewards.description"
                        }
                        unsafe
                    />
                </Paragraph>
                <Alert
                    message={counterpart.translate(
                        "cryptobridge.earn.staking.rewards.disclaimer",
                        {amount: reclaimFee}
                    )}
                    type="warning"
                />
                <List dataSource={rewards} renderItem={renderReward} />
            </div>
        );
    }
}

export default connect(
    BridgeCoinRewards,
    {
        listenTo() {
            return [CryptoBridgeAccountStore];
        },
        getProps() {
            const me = new CryptoBridgeUser(
                CryptoBridgeAccountStore.getState()
            );

            return {
                me
            };
        }
    }
);
