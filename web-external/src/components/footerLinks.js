
import { default as React } from "react";

const ABOUT_URL = "http://girder.readthedocs.org/en/latest/user-guide.html";
const CONTACT_URL = "mailto:kitware@kitware.com";
const BUG_URL = "https://github.com/girder/girder/issues/new";

export default class FooterLinks extends React.Component {
    render() {
        return (
            <div className="g-footer-links">
              <a id="g-about-link" href={ ABOUT_URL }>About</a>
              <a id="g-contact-link" href={ CONTACT_URL }>Contact</a>
              <a href={ this.props.apiRoot }>Web API</a>
              <a id="g-bug-link" href={ BUG_URL }>Report a bug</a>
            </div>
        )
    }
}

