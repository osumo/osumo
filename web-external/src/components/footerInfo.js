
import { default as React } from "react";

const COPYRIGHT = String.fromCharCode(169);

export default class FooterInfo extends React.Component {
    render() {
        return (
            <div className="g-footer-info">
              { COPYRIGHT } Kitware, Inc.
            </div>
        );
    }
}

