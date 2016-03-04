
import React from "react";
import { partial } from "underscore";

export default class UserHeader extends React.Component {
    render() {
        let result;
        let { currentUser, onNavigate } = this.props;

        const go = (path) => partial(onNavigate, path);

        /* TODO(opadron): this should be broken down into further components. */
        if(currentUser) {
            let id = currentUser._id;

            let gotoFolders  = go(`user/${ id }`);
            let gotoSettings = go(`useraccount/${ id }/info`);
            let gotoLogout   = go(`useraccount/${ id }/logout`);

            result = (
                <div className="g-current-user-wrapper">
                  <div className="g-user-text">
                    <a data-toggle="dropdown" data-target="#g-user-action-menu">
                      { currentUser.firstName } { currentUser.lastName }
                      <i className="icon-down-open"/>
                    </a>
                    <div id="g-user-action-menu" className="dropdown">
                      <ul className="dropdown-menu" role="menu">
                        <li role="presentation">
                          <a className="g-my-folders" onClick={ gotoFolders }>
                            <i className="icon-folder">My folders</i>
                          </a>
                        </li>
                        <li role="presentation">
                          <a className="g-my-settings"
                             onClick={ gotoSettings }>
                            <i className="icon-cog">My account</i>
                          </a>
                        </li>
                        <li className="divider" role="presentation"/>
                        <li role="presentation">
                          <a className="g-logout"
                             onClick={ gotoLogout }>
                            <i className="icon-logout">Log out</i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
            );

        } else {
            let gotoLogin    = go("login");
            let gotoRegister = go("register");

            result = (
                <div className="g-current-user-wrapper">
                  <div className="g-user-text">
                    <a className="g-register"
                       onClick={ gotoRegister }>
                       Register
                    </a>
                    <span> or </span>
                    <a className="g-login"
                       onClick={ gotoLogin }>
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

