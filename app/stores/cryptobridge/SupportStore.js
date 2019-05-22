import BaseStore from "stores/BaseStore";
import alt from "alt-instance";
import SupportActions from "actions/cryptobridge/SupportActions";

class SupportStore extends BaseStore {
    constructor() {
        super();

        this.state = this._getInitialState();

        this.bindListeners({
            onFetchTickets: SupportActions.fetchTickets,
            onFetchComments: SupportActions.fetchComments,
            onCloseTicket: SupportActions.closeTicket,
            onAddTicket: SupportActions.addTicket,
            onAddComment: SupportActions.addComment
        });

        this._export("getTickets", "getTicket", "getComments");
    }

    _getInitialState() {
        return {
            tickets: [],
            comments: {}
        };
    }

    getTicket(ticketId) {
        return this.state.tickets.find(ticket => ticket.id === ticketId);
    }

    getTickets() {
        return this.state.tickets || [];
    }

    getComments() {
        return this.state.comments || [];
    }

    onFetchTickets(tickets) {
        this.setState({tickets});
    }

    onFetchComments({ticketId, comments}) {
        if (ticketId) {
            const ticketComments = {};
            ticketComments[ticketId] = comments;
            const updatedComments = Object.assign(
                this.state.comments,
                ticketComments
            );

            this.setState({
                comments: updatedComments
            });
        }
    }

    onCloseTicket(ticketId) {
        const {tickets} = this.state;

        this.setState({
            tickets: tickets.map(ticket => {
                if (ticket.id === ticketId) {
                    ticket.status = "closed";
                }

                return ticket;
            })
        });
    }

    onAddTicket(ticket) {
        console.log("Ticket added", ticket, this.state.tickets);
    }

    onAddComment({ticketId, comment}) {
        console.log("Comment added", ticketId, comment);
    }
}

export default alt.createStore(SupportStore, "SupportStore");
