
import { default as React } from "react";

export default class UserHeader extends React.Component {
    render() {
        var result;
        var user = this.props.user;
        if(user) {
            result = (
                <div className="g-current-user-wrapper">
                  <div className="g-user-text">
                    <a data-toggle="dropdown" data-target="#g-user-action-menu">
                      { user.firstName } { user.lastName }
                      <i className="icon-down-open"/>
                    </a>
                    <div id="g-user-action-menu" className="dropdown">
                      <ul className="dropdown-menu" role="menu">
                        <li role="presentation">
                          <a className="g-my-folders">
                            <i className="icon-folder">My folders</i>
                          </a>
                        </li>
                        <li role="presentation">
                          <a className="g-my-settings">
                            <i className="icon-cog">My account</i>
                          </a>
                        </li>
                        <li className="divider" role="presentation"/>
                        <li role="presentation">
                          <a className="g-logout">
                            <i className="icon-logout">Log out</i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
            );

        } else {
            result = (
                <div className="g-current-user-wrapper">
                  <div className="g-user-text">
                    <a className="g-register">Register</a>
                    <span> or </span>
                    <a className="g-login">
                      Log In
                      <i className="icon-login"/>
                    </a>
                  </div>
                </div>
            );
        }

        return result;
    }
}

