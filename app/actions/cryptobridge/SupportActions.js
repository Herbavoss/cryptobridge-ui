import alt from "alt-instance";

import {getBasicHeaders} from "api/cryptobridge/apiHelpers";
import {cryptoBridgeAPIs} from "api/apiConfig";
import counterpart from "counterpart";
import moment from "moment";

class SupportActions {
    fetchTickets() {
        return dispatch => {
            const options = {
                method: "GET",
                headers: getBasicHeaders()
            };

            const getStatus = statusId => {
                switch (statusId) {
                    case 1:
                        return "open";
                    case 2:
                        return "in_progress";
                    case 3:
                        return "waiting_for_customer";
                    case 4:
                        return "waiting_for_support";
                    case 5:
                        return "blocked";
                    case 6:
                        return "closed";
                    default:
                        return "unknown";
                }
            };

            return fetch(`${cryptoBridgeAPIs.BASE_SUPPORT}/tickets`, options)
                .then(response => {
                    return response.json().then(tickets => {
                        if (response.ok) {
                            return tickets.map(ticket => {
                                // TODO set status in API
                                ticket.status = getStatus(ticket.statusId);
                                ticket.description = ticket.comment;
                                ticket.id = ticket.key;

                                return ticket;
                            });
                        }
                        throw new Error(
                            tickets.message ||
                                counterpart.translate(
                                    "cryptobridge.support.tickets.fetch.error"
                                )
                        );
                    });
                })
                .then(tickets => {
                    dispatch(tickets);
                    return tickets;
                })
                .catch(e => {
                    dispatch([]);
                    throw new Error(e.message);
                });
        };
    }

    fetchComments(ticketId) {
        return dispatch => {
            const options = {
                method: "GET",
                headers: getBasicHeaders()
            };

            return fetch(
                `${cryptoBridgeAPIs.BASE_SUPPORT}/tickets/${ticketId}/comments`,
                options
            )
                .then(response => {
                    return response.json().then(comments => {
                        if (response.ok) {
                            return comments.map(comment => {
                                // TODO do not translate, do this in the API
                                return {
                                    author: comment.username,
                                    avatar: comment.isSupport
                                        ? "/cryptobridge/cryptobridge-logo.svg"
                                        : null, // TODO get user avatar
                                    content: comment.comment,
                                    datetime: moment(comment.datetime).fromNow()
                                };
                            });
                        }
                        throw new Error(
                            comments.message ||
                                counterpart.translate(
                                    "cryptobridge.support.comments.fetch.error"
                                )
                        );
                    });
                })
                .then(comments => {
                    dispatch({ticketId, comments});
                    return comments;
                })
                .catch(e => {
                    dispatch({ticketId, comments: []});
                    throw new Error(e.message);
                });
        };
    }

    addComment(ticketId, comment, reCaptchaToken) {
        return dispatch => {
            const options = {
                method: "POST",
                headers: getBasicHeaders(undefined, {reCaptchaToken}),
                body: JSON.stringify({data: comment})
            };

            return fetch(
                `${cryptoBridgeAPIs.BASE_SUPPORT}/tickets/${ticketId}/comments`,
                options
            )
                .then(response => {
                    return response.json().then(data => {
                        if (response.ok && data.jsdPublic) {
                            return {ticketId, comment};
                        }
                        throw new Error(
                            data.message ||
                                counterpart.translate(
                                    "cryptobridge.support.comments.add.error"
                                )
                        );
                    });
                })
                .then(comments => {
                    dispatch({ticketId, comments});
                    return comments;
                })
                .catch(e => {
                    dispatch({ticketId, comments: []});
                    throw new Error(e.message);
                });
        };
    }

    addTicket(ticket, reCaptchaToken) {
        return dispatch => {
            const options = {
                method: "POST",
                headers: getBasicHeaders(undefined, {reCaptchaToken}),
                body: JSON.stringify(ticket)
            };

            return fetch(`${cryptoBridgeAPIs.BASE_SUPPORT}/tickets`, options)
                .then(response => {
                    return response.json().then(ticket => {
                        if (response.ok && ticket.key) {
                            return ticket;
                        }
                        throw new Error(
                            ticket.message ||
                                counterpart.translate(
                                    "cryptobridge.support.tickets.add.error"
                                )
                        );
                    });
                })
                .then(ticket => {
                    dispatch(ticket);
                    return ticket;
                })
                .catch(e => {
                    dispatch();
                    throw new Error(e.message);
                });
        };
    }

    closeTicket(ticketId) {
        return dispatch => {
            const options = {
                method: "POST",
                headers: getBasicHeaders()
            };

            return fetch(
                `${cryptoBridgeAPIs.BASE_SUPPORT}/tickets/${ticketId}/close`,
                options
            )
                .then(response => {
                    return response.json().then(data => {
                        if (response.ok) {
                            return ticketId;
                        }
                        throw new Error(
                            data.message ||
                                counterpart.translate(
                                    "cryptobridge.support.tickets.close.error"
                                )
                        );
                    });
                })
                .then(ticketId => {
                    dispatch(ticketId);
                    return ticketId;
                })
                .catch(e => {
                    dispatch();
                    throw new Error(e.message);
                });
        };
    }
}

export default alt.createActions(SupportActions);
