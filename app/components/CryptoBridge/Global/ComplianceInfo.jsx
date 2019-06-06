import React from "react";

import {Typography} from "bitshares-ui-style-guide";
const {Paragraph} = Typography;

import Translate from "react-translate-component";

import PropTypes from "prop-types";

export default class ComplianceInfo extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired
    };

    static defaultProps = {
        onClick: e => {}
    };

    render() {
        return (
            <Paragraph>
                <Translate content={"cryptobridge.account.compliance.info"} />
            </Paragraph>
        );
    }
}
