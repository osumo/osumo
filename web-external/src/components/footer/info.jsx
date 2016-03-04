
import React from "react";

import { COPYRIGHT } from "../../constants";

export default class Info extends React.Component {
    render() {
        return (
            <div className="g-footer-info">
              { COPYRIGHT } Kitware, Inc.
            </div>
        );
    }
}

