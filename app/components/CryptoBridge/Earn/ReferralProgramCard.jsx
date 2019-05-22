import React from "react";
import {connect} from "alt-react";

import {ChainStore} from "bitsharesjs";
import {Card, Input, Form, Button, Typography} from "bitshares-ui-style-guide";
const {Paragraph} = Typography;

import CopyButton from "components/Utility/CopyButton";

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";

import counterpart from "counterpart";
import Translate from "react-translate-component";
import {login} from "lib/cryptobridge/accountMethods";

class ReferralProgramCard extends React.Component {
    render() {
        const {account} = this.props;

        const link = account
            ? `https://wallet.crypto-bridge.org/?r=${account
                  .get("id")
                  .replace(/^1.2./, "")}`
            : null;

        return (
            <Card
                title={counterpart.translate(
                    "cryptobridge.earn.referral.card.title"
                )}
            >
                {!link ? (
                    <div>
                        <Paragraph>
                            <Translate
                                content={
                                    "cryptobridge.earn.referral.card.login"
                                }
                            />
                        </Paragraph>
                        <Button type={"primary"} onClick={login}>
                            <Translate content="login.loginButton" />
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Form.Item className="clipboard">
                            <Input
                                disabled={true}
                                value={link}
                                addonBefore={
                                    <CopyButton
                                        text={link}
                                        tip={
                                            "cryptobridge.earn.referral.card.copy"
                                        }
                                        dataPlace="top"
                                        className="button"
                                    />
                                }
                            />
                        </Form.Item>
                        <Paragraph>
                            <Translate
                                content={
                                    "cryptobridge.earn.referral.card.explain"
                                }
                            />
                        </Paragraph>
                    </div>
                )}
            </Card>
        );
    }
}

export default connect(
    ReferralProgramCard,
    {
        listenTo() {
            return [CryptoBridgeAccountStore];
        },
        getProps() {
            const accountName = CryptoBridgeAccountStore.getName();
            const account = ChainStore.getAccount(accountName, null);

            return {
                account
            };
        }
    }
);
