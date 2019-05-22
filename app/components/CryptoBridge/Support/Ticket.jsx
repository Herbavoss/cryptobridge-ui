import React from "react";
import {connect} from "alt-react";

import PropTypes from "prop-types";

import counterpart from "counterpart";
import Translate from "react-translate-component";

import {
    PageHeader,
    Tag,
    Button,
    Typography,
    message
} from "bitshares-ui-style-guide";
import {TicketTag} from "./Tickets";

import Comments from "./Comments";
import SupportActions from "actions/cryptobridge/SupportActions";
import SupportStore from "stores/cryptobridge/SupportStore";

const {Paragraph} = Typography;

class Ticket extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onBack: PropTypes.func.isRequired
    };

    static defaultProps = {
        onClose: () => {},
        onBack: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            ticket: null,
            closing: false
        };
    }

    componentDidUpdate(prevPros) {
        if (
            prevPros.ticketId !== this.props.ticketId ||
            JSON.stringify(prevPros.tickets) !==
                JSON.stringify(this.props.tickets)
        ) {
            this.setState({
                ticket: this.props.tickets.find(
                    ticket => ticket.id === this.props.ticketId
                )
            });
        }
    }

    closeTicket = () => {
        this.setState({
            closing: true
        });

        const {ticket} = this.state;

        SupportActions.closeTicket(ticket.id)
            .then(() => {
                message.success(
                    counterpart.translate(
                        "cryptobridge.support.tickets.close.success"
                    )
                );
                this.props.onClose(ticket);
                this.setState({
                    closing: false
                });
            })
            .catch(e => {
                this.setState({
                    closing: false
                });
                message.error(e.message);
            });
    };

    onBack = () => {
        this.props.onBack();
    };

    render() {
        const {ticket, closing, smallScreen} = this.state;

        if (!ticket) {
            // TODO add some explanation about support
            return null;
        }

        const {title, description, status} = ticket;

        const extra =
            status !== "closed" ? (
                <Button
                    type="danger"
                    onClick={this.closeTicket}
                    loading={closing}
                    size={"small"}
                >
                    <Translate content="cryptobridge.support.tickets.close.title" />
                </Button>
            ) : null;

        return (
            <PageHeader
                title={title}
                tags={<TicketTag status={status} />}
                extra={extra}
                onBack={smallScreen ? this.onBack : undefined}
            >
                <div className="content padding support__ticket">
                    <Paragraph>{description}</Paragraph>
                    <Comments ticketId={ticket.id} />
                </div>
            </PageHeader>
        );
    }
}

export default connect(
    Ticket,
    {
        listenTo() {
            return [SupportStore];
        },
        getProps() {
            const tickets = SupportStore.getTickets();

            return {
                tickets
            };
        }
    }
);
