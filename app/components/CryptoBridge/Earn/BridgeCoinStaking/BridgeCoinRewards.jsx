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
            const actions = [actionButton(reward.id, "claim")];

            const period = `${reward.from.substr(0, 10)} - ${reward.to.substr(
                0,
                10
            )}`;
            const rewardUsd = `${counterpart.translate(
                "cryptobridge.earn.staking.rewards.reward.usd"
            )} ${reward.payout}`;
            const payoutBco = `${counterpart.translate(
                "cryptobridge.earn.staking.rewards.reward.payout"
            )} ${reward.amount} BCO (@ ${reward.price} BCO/USD)`;

            return (
                <List.Item
                    actions={actions}
                    extra={actionButton(reward.id, "stake")}
                >
                    <List.Item.Meta title={period} description={payoutBco} />
                    <div>{rewardUsd}</div>
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
                <Paragraph>
                    <Alert
                        message={counterpart.translate(
                            "cryptobridge.earn.staking.rewards.disclaimer",
                            {amount: reclaimFee}
                        )}
                        type="warning"
                    />
                </Paragraph>
                <List
                    dataSource={rewards}
                    renderItem={renderReward}
                    header={counterpart.translate(
                        "cryptobridge.earn.staking.rewards.list"
                    )}
                    bordered={true}
                />
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
