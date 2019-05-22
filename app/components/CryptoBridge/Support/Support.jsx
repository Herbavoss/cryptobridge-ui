import React from "react";
import {connect} from "alt-react";

import counterpart from "counterpart";
import Translate from "react-translate-component";

import {Tabs, Row, Col, Button, Typography} from "bitshares-ui-style-guide";
const {Title, Paragraph} = Typography;

import Tickets from "./Tickets";
import Ticket from "./Ticket";
import Faqs from "./Faqs";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import {login} from "lib/cryptobridge/accountMethods";

class Support extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: props.authenticated || false,
            selectedTicketId: null
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.authenticated && !prevProps.authenticated) {
            this.setState({authenticated: this.props.authenticated});
        }
    }

    onTicketSelect = selectedTicketId => {
        this.setState({selectedTicketId});
    };

    render() {
        const {selectedTicketId, authenticated} = this.state;

        const support = (
            <Row>
                <Col
                    xs={{span: 24}}
                    lg={{span: 8}}
                    className={selectedTicketId ? "hide-column-small" : null}
                >
                    <Tickets onSelect={this.onTicketSelect} />
                </Col>
                <Col xs={{span: 24}} lg={{span: 16}}>
                    <Ticket
                        ticketId={selectedTicketId}
                        onBack={() => {
                            this.setState({selectedTicketId: null});
                        }}
                    />
                </Col>
            </Row>
        );

        const authenticate = (
            <Row type="flex" justify="center">
                <Col
                    xs={{span: 20}}
                    lg={{span: 8}}
                    style={{textAlign: "center"}}
                >
                    <Title level={2}>
                        <Translate content="cryptobridge.support.title" />
                    </Title>
                    <Paragraph>
                        <Translate content="cryptobridge.support.description" />
                    </Paragraph>
                    <Button type="primary" onClick={login}>
                        <Translate content="login.loginButton" />
                    </Button>
                </Col>
            </Row>
        );

        return (
            <Tabs defaultActiveKey={"contact"}>
                <Tabs.TabPane
                    tab={counterpart.translate(
                        "cryptobridge.support.faq.title"
                    )}
                    key="faq"
                >
                    <Row>
                        <Col>
                            <Faqs />
                        </Col>
                    </Row>
                </Tabs.TabPane>
                <Tabs.TabPane
                    tab={counterpart.translate(
                        "cryptobridge.support.contact.title"
                    )}
                    key="contact"
                >
                    {authenticated ? support : authenticate}
                </Tabs.TabPane>
            </Tabs>
        );
    }
}

export default connect(
    Support,
    {
        listenTo() {
            return [CryptoBridgeAccountStore];
        },
        getProps() {
            const authenticated = CryptoBridgeAccountStore.getIsAuthenticated();

            return {
                authenticated
            };
        }
    }
);
