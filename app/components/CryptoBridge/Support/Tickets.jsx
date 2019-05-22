import React from "react";
import {connect} from "alt-react";
import counterpart from "counterpart";
import Translate from "react-translate-component";

import {
    PageHeader,
    List,
    Button,
    Modal,
    Tabs,
    Typography,
    Form,
    Tag
} from "bitshares-ui-style-guide";
const {Paragraph, Text} = Typography;

import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";
import SupportStore from "stores/cryptobridge/SupportStore";
import SupportActions from "actions/cryptobridge/SupportActions";
import PropTypes from "prop-types";

import {
    WrappedWithdrawalIssueForm,
    WrappedDepositIssueForm,
    WrappedOtherIssueForm
} from "./TicketForm";

export class TicketTag extends React.Component {
    static propTypes = {
        status: PropTypes.oneOf([
            "undefined",
            "open",
            "in_progress",
            "waiting_for_customer",
            "waiting_for_support",
            "blocked",
            "closed"
        ])
    };

    static defaultProps = {
        status: "waiting_for_customer"
    };

    render() {
        const {status} = this.props;

        if (status === "undefined") {
            return null;
        }

        return (
            <Tag>
                <Translate
                    content={`cryptobridge.support.tickets.status.${status}`}
                />
            </Tag>
        );
    }
}

export class Ticket extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired
    };

    onClick = e => {
        e.preventDefault();
        this.props.onClick(this.props.id);
    };

    render() {
        const {title, description, comment, status, active} = this.props; // TODO replace comment with descrption in API

        return (
            <List.Item
                title={title}
                extra={<TicketTag status={status} />}
                onClick={this.onClick}
                className={`support__tickets__ticket ${
                    active ? "support__tickets__ticket--active" : ""
                }`}
            >
                <List.Item.Meta
                    title={<Text ellipsis={true}>{title}</Text>}
                    description={
                        <Paragraph ellipsis={{rows: 2}}>
                            {description || comment}
                        </Paragraph>
                    }
                />
            </List.Item>
        );
    }
}

export class NewTicketModal extends React.Component {
    render() {
        const {visible, onCancel, onSuccess} = this.props;
        const formProps = {
            onCancel,
            onSuccess
        };

        return (
            <Modal
                title={counterpart.translate(
                    "cryptobridge.support.tickets.create.title"
                )}
                visible={visible}
                footer={null}
                onCancel={onCancel}
            >
                <Paragraph>
                    <Translate
                        content={
                            "cryptobridge.support.tickets.create.description"
                        }
                    />
                </Paragraph>
                <Tabs>
                    <Tabs.TabPane
                        key={"withdrawal"}
                        tab={counterpart.translate(
                            "cryptobridge.support.tickets.type.withdrawal"
                        )}
                    >
                        <WrappedWithdrawalIssueForm {...formProps} />
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        key={"deposit"}
                        tab={counterpart.translate(
                            "cryptobridge.support.tickets.type.deposit"
                        )}
                    >
                        <WrappedDepositIssueForm {...formProps} />
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        key={"other"}
                        tab={counterpart.translate(
                            "cryptobridge.support.tickets.type.other"
                        )}
                    >
                        <WrappedOtherIssueForm {...formProps} />
                    </Tabs.TabPane>
                </Tabs>
            </Modal>
        );
    }
}

class Tickets extends React.Component {
    static propTypes = {
        onSelect: PropTypes.func.isRequired
    };

    static defaultProps = {
        onSelect: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            newTicketModalVisible: false,
            authenticated: props.authenticated || false,
            tickets: props.tickets || [],
            selectedTicketId: null
        };
    }

    componentDidMount() {
        if (this.props.authenticated) {
            this.fetchTickets();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.authenticated && !prevProps.authenticated) {
            this.setState({authenticated: this.props.authenticated});
            this.fetchTickets();
        } else if (this.props.closedTicketId !== prevProps.closedTicketId) {
            this.fetchTickets();
        }

        if (
            JSON.stringify(prevProps.tickets) !==
            JSON.stringify(this.props.tickets)
        ) {
            this.setState({tickets: this.props.tickets}, () => {
                const {tickets, selectedTicketId} = this.state;
                if (!selectedTicketId && tickets.length) {
                    this.selectTicket(tickets[0].id);
                }
            });
        }
    }

    fetchTickets() {
        this.setState({
            loading: true
        });

        SupportActions.fetchTickets()
            .then(() => {
                this.setState({
                    loading: false
                });
            })
            .catch(() => {
                this.setState({
                    loading: false
                });
            });
    }

    openNewTicketModal = () => {
        this.setState({
            newTicketModalVisible: true
        });
    };

    onTicketClick = ticketId => {
        this.selectTicket(ticketId);
    };

    selectTicket = ticketId => {
        this.setState({
            selectedTicketId: ticketId
        });

        this.props.onSelect(ticketId);
    };

    closeNewTicketModal = () => {
        this.setState({newTicketModalVisible: false});
    };

    onSuccess = () => {
        this.closeNewTicketModal();
        this.fetchTickets();
    };

    render() {
        const {
            tickets,
            loading,
            selectedTicketId,
            newTicketModalVisible,
            authenticated
        } = this.state;

        if (!authenticated) {
            return null;
        }

        return (
            <PageHeader
                title={counterpart.translate(
                    "cryptobridge.support.tickets.title"
                )}
                extra={
                    <Button onClick={this.openNewTicketModal}>
                        <Translate content="cryptobridge.support.tickets.create.title" />
                    </Button>
                }
            >
                <div className="content support__tickets">
                    <NewTicketModal
                        visible={newTicketModalVisible}
                        onCancel={this.closeNewTicketModal}
                        onSuccess={this.onSuccess}
                    />
                    <List
                        itemLayout="horizontal"
                        dataSource={tickets}
                        renderItem={props => (
                            <Ticket
                                {...props}
                                onClick={this.onTicketClick}
                                active={selectedTicketId === props.id}
                            />
                        )}
                        loading={loading}
                        locale={{
                            emptyText: counterpart.translate(
                                "cryptobridge.support.tickets.none"
                            )
                        }}
                    />
                </div>
            </PageHeader>
        );
    }
}

export default connect(
    Tickets,
    {
        listenTo() {
            return [SupportStore, CryptoBridgeAccountStore];
        },
        getProps() {
            const authenticated = CryptoBridgeAccountStore.getIsAuthenticated();
            const tickets = SupportStore.getTickets();

            return {
                authenticated,
                tickets
            };
        }
    }
);
