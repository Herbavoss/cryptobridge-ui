import React from "react";

import Translate from "react-translate-component";

import {Typography, Row, Col, Button} from "bitshares-ui-style-guide";
const {Title, Paragraph} = Typography;

export default class TradingCompetition extends React.Component {
    render() {
        const {account} = this.props;

        return (
            <div className={"content padding"}>
                <Row gutter={32}>
                    <Col xs={{span: 24}} lg={{span: 14}}>
                        <Title level={4}>
                            <Translate
                                content={"cryptobridge.earn.competition.claim"}
                            />
                        </Title>

                        <Paragraph>
                            <Translate
                                content={
                                    "cryptobridge.earn.competition.description"
                                }
                                unsafe
                            />
                        </Paragraph>

                        <Title level={4}>
                            <Translate
                                content={
                                    "cryptobridge.earn.competition.leaderboard.title"
                                }
                            />
                        </Title>

                        <Paragraph>
                            <Translate
                                content={
                                    "cryptobridge.earn.competition.leaderboard.description_1"
                                }
                            />
                        </Paragraph>

                        <Paragraph>
                            <Button
                                onClick={() => {
                                    window.open(
                                        `https://widgets.crypto-bridge.org/leaderboard/?type=trading&pageSize=10&me=${account}&modal=true`
                                    );
                                }}
                            >
                                <Translate
                                    content={
                                        "cryptobridge.earn.competition.leaderboard.action"
                                    }
                                />
                            </Button>
                        </Paragraph>
                    </Col>
                    <Col xs={{span: 24}} lg={{span: 10}}>
                        <iframe
                            src={`https://widgets.crypto-bridge.org/leaderboard/?type=trading&pageSize=10&me=${account}`}
                            style={{width: "100%", height: "700px"}}
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
