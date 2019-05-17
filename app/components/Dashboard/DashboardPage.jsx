import React from "react";
import {connect} from "alt-react";

import LoadingIndicator from "../LoadingIndicator";
import LoginSelector from "../LoginSelector";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";

import {Tabs} from "bitshares-ui-style-guide";
import {StarredMarkets, FeaturedMarkets} from "./Markets";
import {getPossibleGatewayPrefixes} from "common/gateways";

/* CRYPTOBRIDGE */
import Translate from "react-translate-component";
import AssetImage from "../Utility/CryptoBridge/AssetImage";
import Icon from "components/Icon/Icon";
/* /CRYPTOBRIDGE */

class DashboardPage extends React.Component {
    render() {
        let {
            myActiveAccounts,
            myHiddenAccounts,
            accountsReady,
            passwordAccount,
            preferredBases
        } = this.props;
        if (!accountsReady) {
            return <LoadingIndicator />;
        }

        let accountCount =
            myActiveAccounts.size +
            myHiddenAccounts.size +
            (passwordAccount ? 1 : 0);
        if (!accountCount) {
            return <LoginSelector />;
        }

        return (
            <div className="grid-block page-layout">
                <div className="grid-block no-padding">
                    <div
                        className="grid-content app-tables no-padding"
                        ref="appTables"
                    >
                        <div className="content-block small-12">
                            <div className="tabs-container generic-bordered-box">
                                <Tabs
                                    defaultActiveTab={"bridge.btc"}
                                    className="account-tabs"
                                >
                                    <Tabs.TabPane
                                        key={"starred_markets"}
                                        tab={
                                            <span>
                                                <Icon
                                                    name="fi-star"
                                                    size="1_5x"
                                                    className="gold-star"
                                                />
                                                <Translate content="dashboard.starred_markets" />
                                            </span>
                                        }
                                    >
                                        <StarredMarkets />
                                    </Tabs.TabPane>
                                    {preferredBases.sort().map(q => {
                                        let title = (
                                            <span>
                                                <AssetImage asset={q} />
                                                {q.replace(/bridge\./i, "")}
                                            </span>
                                        );

                                        return (
                                            <Tabs.TabPane key={q} tab={title}>
                                                <FeaturedMarkets
                                                    quotes={[q].concat(
                                                        getPossibleGatewayPrefixes(
                                                            [q]
                                                        )
                                                    )}
                                                />
                                            </Tabs.TabPane>
                                        );
                                    })}
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    DashboardPage,
    {
        listenTo() {
            return [AccountStore, SettingsStore];
        },
        getProps() {
            let {
                myActiveAccounts,
                myHiddenAccounts,
                passwordAccount,
                accountsLoaded,
                refsLoaded
            } = AccountStore.getState();

            return {
                myActiveAccounts,
                myHiddenAccounts,
                passwordAccount,
                accountsReady: accountsLoaded && refsLoaded,
                preferredBases: SettingsStore.getState().preferredBases
            };
        }
    }
);
