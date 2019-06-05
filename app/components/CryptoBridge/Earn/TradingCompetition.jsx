import React from "react";

import Translate from "react-translate-component";

import {Typography, Row, Col} from "bitshares-ui-style-guide";
const {Title, Paragraph} = Typography;

export default class TradingCompetition extends React.Component {
    render() {
        const {account} = this.props;

        return (
            <div className={"content padding"}>
                <Row gutter={32}>
                    <Col xs={{span: 24}} lg={{span: 16}}>
                        <Title level={4}>
                            <Translate
                                content={"cryptobridge.earn.competition.claim"}
                            />
                        </Title>

                        <Paragraph>
                            <Translate
                                content={
                                    "cryptobridge.earn.competition.intro_text_1"
                                }
                            />
                        </Paragraph>
                    </Col>
                    <Col xs={{span: 24}} lg={{span: 8}}>
                        <iframe
                            src={`https://widgets.crypto-bridge.org/leaderboard/?type=trading&pageSize=10&me=${account}`}
                            style={{width: "100%", height: "600px"}}
                            frameBorder="0"
                        >
                            Browser not compatible.
                        </iframe>
                    </Col>
                </Row>
            </div>
        );
    }
}
