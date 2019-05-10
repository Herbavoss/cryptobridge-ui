import React from "react";
import Translate from "react-translate-component";
import ReactTooltip from "react-tooltip";
import utils from "common/utils";
import SettingsActions from "actions/SettingsActions";
import AccountRegistrationForm from "./AccountRegistrationForm";
import AccountRegistrationConfirm from "./AccountRegistrationConfirm";

class AccountRegistration extends React.Component {
    constructor() {
        super();
        this.state = {
            accountName: "",
            confirmed: false
        };
        this.continue = this.continue.bind(this);
    }

    componentWillMount() {
        SettingsActions.changeSetting({
            setting: "passwordLogin",
            value: true
        });
    }

    componentDidMount() {
        ReactTooltip.rebuild();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !utils.are_equal_shallow(nextState, this.state);
    }

    continue({accountName, password, usCitizen}) {
        this.setState({
            accountName,
            password,
            usCitizen,
            confirmationStep: true
        });
    }

    onConfirmChange = confirmed => {
        this.setState({
            confirmed
        });
    };

    render() {
        return (
            <div className="no-margin grid-block registration-layout registration">
                <div className="grid-block horizontal align-center text-center">
                    <div>
                        <img
                            className={`model-img ${
                                this.state.confirmed ? "confirmed" : ""
                            }`}
                            src="/model-type-images/account.svg"
                            alt="account"
                        />
                    </div>
                    <div className="create-account-block">
                        <Translate
                            component="h3"
                            className="registration-account-title"
                            content="registration.createByPassword"
                        />
                        {!this.state.confirmationStep ? (
                            <AccountRegistrationForm continue={this.continue} />
                        ) : (
                            <AccountRegistrationConfirm
                                accountName={this.state.accountName}
                                password={this.state.password}
                                usCitizen={this.state.usCitizen}
                                onChange={this.onConfirmChange}
                                history={this.props.history}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountRegistration;
