import React from "react";

import {Typography} from "bitshares-ui-style-guide";
const {Paragraph, Title} = Typography;

import Translate from "react-translate-component";

import PropTypes from "prop-types";

export default class ComplianceInfo extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        requiresTermsAndConditions: PropTypes.bool.isRequired,
        requiresUserVerification: PropTypes.bool.isRequired
    };

    static defaultProps = {
        onClick: e => {},
        requiresTermsAndConditions: false,
        requiresUserVerification: false
    };

    render() {
        const {
            requiresTermsAndConditions,
            requiresUserVerification
        } = this.props;

        return (
            <Paragraph>
                <Title level={4}>
                    <Translate
                        content={"cryptobridge.account.compliance.info"}
                    />
                </Title>
                {requiresTermsAndConditions ? (
                    <Paragraph>
                        <Translate
                            content={"cryptobridge.account.compliance.terms"}
                        />
                    </Paragraph>
                ) : null}
                {requiresUserVerification ? (
                    <Paragraph>
                        <Translate
                            content={
                                "cryptobridge.account.compliance.user_verification"
                            }
                        />
                    </Paragraph>
                ) : null}
            </Paragraph>
        );
    }
}
