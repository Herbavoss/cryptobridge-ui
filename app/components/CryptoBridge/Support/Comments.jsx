import React from "react";
import {connect} from "alt-react";

import Translate from "react-translate-component";
import counterpart from "counterpart";

import {
    Comment,
    Input,
    List,
    Form,
    Button,
    Typography
} from "bitshares-ui-style-guide";

import {CryptoBridgeUser} from "../Account";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";

import SupportActions from "actions/cryptobridge/SupportActions";
import SupportStore from "stores/cryptobridge/SupportStore";

import AccountImage from "components/Account/AccountImage";

const Editor = ({onChange, onSubmit, submitting, value}) => (
    <div>
        <Form.Item>
            <Input.TextArea rows={4} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item>
            <Button
                htmlType="submit"
                loading={submitting}
                onClick={onSubmit}
                type="primary"
            >
                <Translate
                    content={"cryptobridge.support.comments.add.title"}
                />
            </Button>
        </Form.Item>
    </div>
);

class Comments extends React.Component {
    state = {
        ticketComments: [],
        submitting: false,
        loading: false,
        value: ""
    };

    componentDidMount() {
        if (this.props.ticketId) {
            SupportActions.fetchComments(this.props.ticketId);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.ticketId !== this.props.ticketId) {
            this.fetchComments(this.props.ticketId);
        }

        const ticketComments = this.props.comments[this.props.ticketId] || [];

        if (
            JSON.stringify(this.state.ticketComments) !==
            JSON.stringify(ticketComments)
        ) {
            this.setState({
                ticketComments: ticketComments.map(comment => {
                    if (!comment.avatar) {
                        comment.avatar = (
                            <AccountImage
                                account={name}
                                size={{height: 30, width: 30}}
                            />
                        );
                    }

                    return comment;
                })
            });
        }
    }

    fetchComments(ticketId) {
        this.setState({
            loading: true
        });

        SupportActions.fetchComments(ticketId)
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

    handleSubmit = () => {
        if (!this.state.value) {
            return;
        }

        this.setState({
            submitting: true
        });

        const {value} = this.state;
        const {ticketId} = this.props;

        SupportActions.addComment(ticketId, value)
            .then(() => {
                this.setState(
                    {
                        submitting: false,
                        value: ""
                    },
                    () => {
                        this.fetchComments(this.props.ticketId);
                    }
                );
            })
            .catch(e => {
                message.error(e.message);
            });
    };

    handleChange = e => {
        this.setState({
            value: e.target.value
        });
    };

    render() {
        const {ticketComments, submitting, loading, value} = this.state;

        return (
            <div>
                <List
                    dataSource={ticketComments}
                    header="Comments"
                    itemLayout="horizontal"
                    renderItem={props => <Comment {...props} />}
                    loading={loading}
                    locale={{
                        emptyText: counterpart.translate(
                            "cryptobridge.support.comments.none"
                        )
                    }}
                />
                <Editor
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    submitting={submitting}
                    value={value}
                />
            </div>
        );
    }
}

export default connect(
    Comments,
    {
        listenTo() {
            return [CryptoBridgeAccountStore, SupportStore];
        },
        getProps() {
            const me = new CryptoBridgeUser(CryptoBridgeAccountStore.getMe());
            const authenticated = CryptoBridgeAccountStore.getIsAuthenticated();
            const comments = SupportStore.getComments();

            return {
                authenticated,
                me,
                comments
            };
        }
    }
);
