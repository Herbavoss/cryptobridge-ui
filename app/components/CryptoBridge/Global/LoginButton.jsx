import React from "react";

import {Form, Button, Typography} from "bitshares-ui-style-guide";
const {Paragraph} = Typography;

import Translate from "react-translate-component";

import {login} from "lib/cryptobridge/accountMethods";
import PropTypes from "prop-types";

export default class LoginButton extends React.Component {
    static propTypes = {
        type: PropTypes.oneOf("primary", "default"),
        title: PropTypes.string,
        onClick: PropTypes.func.isRequired
    };

    static defaultProps = {
        type: "primary",
        title: undefined,
        onClick: e => {
            e.preventDefault();
            login();
        }
    };

    render() {
        const {title, onClick} = this.props;

        return (
            <Form.Item>
                {title ? <Paragraph>{title}</Paragraph> : null}
                <Button type={"primary"} onClick={onClick}>
                    <Translate content="login.loginButton" />
                </Button>
            </Form.Item>
        );
    }
}
