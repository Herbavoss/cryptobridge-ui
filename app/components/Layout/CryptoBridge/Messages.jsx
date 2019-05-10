import React from "react";
import SettingsStore from "stores/SettingsStore";
import {connect} from "alt-react";
import CryptoBridgeAccountStore from "stores/cryptobridge/CryptoBridgeAccountStore";

class Message extends React.Component {
    render() {
        return null;
    }
}

class Messages extends React.Component {
    render() {
        return <Message />;
    }
}

export default connect(
    Messages,
    {
        listenTo() {
            return [SettingsStore, CryptoBridgeAccountStore];
        },
        getProps() {
            const {hiddenImportantMessages} = SettingsStore.getState();
            const authenticated = CryptoBridgeAccountStore.getIsAuthenticated();

            return {
                hiddenImportantMessages,
                requiresTermsAndConditions:
                    authenticated &&
                    CryptoBridgeAccountStore.getRequiresTermsAndConditions(),
                requiresUserIdentification:
                    authenticated &&
                    CryptoBridgeAccountStore.getRequiresUserIdentification(),
                userIdentificationIsPending:
                    authenticated &&
                    CryptoBridgeAccountStore.getUserIdentificationIsPending()
            };
        }
    }
);
