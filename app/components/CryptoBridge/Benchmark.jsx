import React from "react";
import Translate from "react-translate-component";

import Icon from "components/Icon/Icon";

export default class Benchmark extends React.Component {
    render() {
        return (
            <div className="grid-block vertical">
                <div className="grid-container">
                    <div className="grid-content" style={{paddingTop: "2rem"}}>
                        <Icon
                            name="benchmark"
                            size="10x"
                            className="pull-left"
                        />

                        <Translate
                            component="p"
                            content="cryptobridge.benchmark.intro_text_1"
                        />
                        <Translate
                            component="p"
                            content="cryptobridge.benchmark.intro_text_2"
                        />
                        <Translate
                            component="p"
                            content="cryptobridge.benchmark.intro_text_3"
                        />
                        <Translate
                            component="p"
                            content="cryptobridge.benchmark.intro_text_4"
                        />
                        <Translate
                            component="p"
                            content="cryptobridge.benchmark.intro_text_5"
                        />

                        <p>
                            To view the full range of DARC evaluations{" "}
                            <a
                                href="https://www.darc.network/research"
                                target={"_blank"}
                            >
                                click here
                            </a>
                            .
                        </p>

                        <p>
                            For more information about having your project
                            reviewed, contact{" "}
                            <a href="mailto:benchmark@crypto-bridge.org">
                                benchmark@crypto-bridge.org
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
