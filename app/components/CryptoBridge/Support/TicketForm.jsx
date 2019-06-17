import React from "react";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import PropTypes from "prop-types";

import SupportActions from "actions/cryptobridge/SupportActions";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";

import {
    Form,
    Input,
    InputNumber,
    Button,
    message
} from "bitshares-ui-style-guide";
import DepositWithdrawAssetSelector from "components/DepositWithdraw/DepositWithdrawAssetSelector";
import ReCAPTCHA from "components/Utility/CryptoBridge/ReCAPTCHA";

const formItemAsset = getFieldDecorator => {
    return (
        <Form.Item
            label={counterpart.translate(
                "cryptobridge.support.tickets.create.form.asset.label"
            )}
        >
            {getFieldDecorator("coin", {
                rules: [
                    {
                        required: true,
                        message: counterpart.translate(
                            "cryptobridge.support.tickets.create.form.asset.error"
                        )
                    }
                ]
            })(
                <DepositWithdrawAssetSelector
                    placeholder={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.asset.placeholder"
                    )}
                />
            )}
        </Form.Item>
    );
};

const formItemAmount = getFieldDecorator => {
    return (
        <Form.Item
            label={counterpart.translate(
                "cryptobridge.support.tickets.create.form.amount.label"
            )}
        >
            {getFieldDecorator("amount", {
                rules: [
                    {
                        required: true,
                        message: counterpart.translate(
                            "cryptobridge.support.tickets.create.form.amount.error"
                        )
                    }
                ]
            })(
                <InputNumber
                    style={{width: "50%"}}
                    placeholder={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.amount.placeholder"
                    )}
                />
            )}
        </Form.Item>
    );
};

const formItemMessage = getFieldDecorator => {
    return (
        <Form.Item
            label={counterpart.translate(
                "cryptobridge.support.tickets.create.form.message.label"
            )}
        >
            {getFieldDecorator("comment", {
                rules: [
                    {
                        required: true,
                        message: counterpart.translate(
                            "cryptobridge.support.tickets.create.form.message.error"
                        )
                    }
                ]
            })(
                <Input.TextArea
                    rows={5}
                    placeholder={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.message.placeholder"
                    )}
                />
            )}
        </Form.Item>
    );
};

const formItemTransactionId = getFieldDecorator => {
    return (
        <Form.Item
            label={counterpart.translate(
                "cryptobridge.support.tickets.create.form.transaction_id.label"
            )}
        >
            {getFieldDecorator("transactionId", {
                rules: [
                    {
                        required: true,
                        message: counterpart.translate(
                            "cryptobridge.support.tickets.create.form.transaction_id.error"
                        )
                    }
                ]
            })(
                <Input
                    placeholder={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.transaction_id.placeholder"
                    )}
                />
            )}
        </Form.Item>
    );
};

const formItemRecipientAddress = getFieldDecorator => {
    return (
        <Form.Item
            label={counterpart.translate(
                "cryptobridge.support.tickets.create.form.recipient_address.label"
            )}
        >
            {getFieldDecorator("recipientAddress", {
                rules: [
                    {
                        required: true,
                        message: counterpart.translate(
                            "cryptobridge.support.tickets.create.form.recipient_address.error"
                        )
                    }
                ]
            })(
                <Input
                    placeholder={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.recipient_address.placeholder"
                    )}
                />
            )}
        </Form.Item>
    );
};

class WithdrawalIssueForm extends React.Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <TicketForm {...this.props} issueType={"withdrawal"}>
                {formItemAsset(getFieldDecorator)}
                {formItemRecipientAddress(getFieldDecorator)}
                {formItemAmount(getFieldDecorator)}
                {formItemMessage(getFieldDecorator)}
            </TicketForm>
        );
    }
}

class DepositIssueForm extends React.Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <TicketForm {...this.props} issueType={"deposit"}>
                {formItemAsset(getFieldDecorator)}
                {formItemTransactionId(getFieldDecorator)}
                {formItemAmount(getFieldDecorator)}
                {formItemMessage(getFieldDecorator)}
            </TicketForm>
        );
    }
}

class OtherIssueForm extends React.Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <TicketForm {...this.props} issueType={"other"}>
                {formItemMessage(getFieldDecorator)}
            </TicketForm>
        );
    }
}

export const WrappedWithdrawalIssueForm = Form.create({
    name: "support_withdrawal"
})(WithdrawalIssueForm);
export const WrappedDepositIssueForm = Form.create({name: "support_deposit"})(
    DepositIssueForm
);
export const WrappedOtherIssueForm = Form.create({name: "support_other"})(
    OtherIssueForm
);

export default class TicketForm extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        onSuccess: PropTypes.func.isRequired
    };

    static defaultProps = {
        onCancel: () => {},
        onSuccess: () => {}
    };

    state = {
        loading: false
    };

    onSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const title = `TODO: create title on API side: ${
                    this.props.issueType
                }`;

                const {reCaptchaToken} = values;

                const ticket = Object.assign(
                    {
                        title: title,
                        comment: values.message,
                        issueType: this.props.issueType
                    },
                    values
                );

                delete ticket.reCaptchaToken;

                this.setState({
                    loading: true
                });

                SupportActions.addTicket(ticket, reCaptchaToken)
                    .then(() => {
                        this.setState({
                            loading: false
                        });
                        message.success(
                            counterpart.translate(
                                "cryptobridge.support.tickets.add.success"
                            )
                        );
                        this.props.onSuccess();
                    })
                    .catch(e => {
                        message.error(e.message);

                        this.setState({
                            loading: false
                        });
                    });
            }
        });
    };

    cancel = e => {
        e.preventDefault();
        this.props.onCancel();
    };

    getHasError() {
        const fieldsErrors = this.props.form.getFieldsError();

        return Object.keys(fieldsErrors).some(field => fieldsErrors[field]);
    }

    render() {
        const {loading} = this.state;
        const {getFieldDecorator} = this.props.form;

        const hasErrors = this.getHasError();
        const user = CryptoBridgeAccountStore.getName();

        return (
            <Form onSubmit={this.onSubmit}>
                {this.props.children}
                <Form.Item
                    label={counterpart.translate(
                        "cryptobridge.support.tickets.create.form.recaptcha.label"
                    )}
                >
                    {getFieldDecorator("reCaptchaToken", {
                        rules: [
                            {
                                required: true,
                                message: counterpart.translate(
                                    "cryptobridge.support.tickets.create.form.recaptcha.error"
                                )
                            }
                        ]
                    })(<ReCAPTCHA payload={{user}} />)}
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={hasErrors}
                        loading={loading}
                        style={{marginRight: "0.75rem"}}
                    >
                        <Translate content="cryptobridge.support.tickets.create.title" />
                    </Button>
                    <Button onClick={this.cancel}>
                        <Translate content="global.cancel" />
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}
