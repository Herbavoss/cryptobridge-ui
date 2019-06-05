import React from "react";
import {connect} from "alt-react";

import Translate from "react-translate-component";
import counterpart from "counterpart";

import {ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";
import BridgeCoinStakingBalances from "./BridgeCoinStakingBalances";
import {Typography, Row, Col, Card} from "bitshares-ui-style-guide";
const {Paragraph, Title} = Typography;
import ChainTypes from "components/Utility/ChainTypes";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import BridgeCoinStakingForm from "./BridgeCoinStakingForm";
import BridgeCoinRewards from "./BridgeCoinRewards";
import {List} from "immutable";

class BridgeCoinStaking extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount
    };

    constructor(props) {
        super(props);

        this.state = {
            stakingBalances: [],
            reclaimFee: null
        };
    }

    componentDidMount() {
        this.unmounted = false;

        const {account} = this.props;

        if (account) {
            this.retrieveStakingBalances(account.get("id"));
        }
    }

    componentDidUpdate(prevProps) {
        const accountChange =
            JSON.stringify(this.props.account) !==
            JSON.stringify(prevProps.account);
        const balanceChange =
            JSON.stringify(this.props.accountBalances) !==
            JSON.stringify(prevProps.accountBalances);

        if (accountChange || balanceChange) {
            this.forceUpdate();
        }

        if (accountChange && this.props.account) {
            this.retrieveStakingBalances(this.props.account.get("id"));
        }
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    retrieveStakingBalances(accountId) {
        accountId = accountId || this.props.account.get("id");
        Apis.instance()
            .db_api()
            .exec("get_vesting_balances", [accountId])
            .then(stakingBalances => {
                if (!this.unmounted) {
                    stakingBalances = stakingBalances.filter(
                        vb =>
                            vb.balance.amount &&
                            vb.balance.asset_id === __BCO_ASSET_ID__
                    );
                    this.setState({stakingBalances});
                }
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    render() {
        const {stakingBalances, reclaimFee} = this.state;
        const {account} = this.props;

        return (
            <div className="content padding">
                <Row gutter={32}>
                    <Col xs={{span: 24}} lg={{span: 16}}>
                        <BridgeCoinRewards reclaimFee={reclaimFee} />
                        <Title level={4}>
                            <Translate
                                content="cryptobridge.earn.staking.intro_text_1"
                                with={{percent: "50%"}}
                            />
                        </Title>
                        <Paragraph>
                            <Translate content="cryptobridge.earn.staking.intro_text_2" />
                        </Paragraph>
                        <Paragraph>
                            <Translate
                                content="cryptobridge.earn.staking.intro_text_3"
                                with={{
                                    url: "https://crypto-bridge.org/bridgecoin/"
                                }}
                                unsafe
                            />
                        </Paragraph>
                        <BridgeCoinStakingBalances
                            balances={stakingBalances}
                            account={account}
                        />
                    </Col>
                    <Col xs={{span: 24}} lg={{span: 8}}>
                        <Card
                            title={counterpart.translate(
                                "cryptobridge.earn.staking.create"
                            )}
                        >
                            <BridgeCoinStakingForm
                                account={account}
                                balances={this.props.accountBalances}
                                onReclaimFeeChange={reclaimFee => {
                                    this.setState({reclaimFee});
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default connect(
    BridgeCoinStaking,
    {
        listenTo() {
            return [CryptoBridgeAccountStore];
        },
        getProps() {
            const accountName = CryptoBridgeAccountStore.getName();
            const account = ChainStore.getAccount(accountName, null);

            const accountBalances = account
                ? account
                      .get("balances", List())
                      .toList()
                      .map(balance => {
                          return ChainStore.getObject(balance);
                      })
                : [];

            return {
                account,
                accountBalances
            };
        }
    }
);
