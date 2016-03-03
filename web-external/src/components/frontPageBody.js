
import { default as React } from "react";

import { ABOUT_URL as GIRDER_RTD, NBSP as S } from "../constants";

export default class FrontPageBody extends React.Component {
    render() {
        return (
            <div className="g-frontpage-body">
              <p className="g-frontpage-paragraph">
                <b>Welcome to Girder!</b>
                { S }If this is your first time here, you might want to check
                out the
                <a target="_blank" href={ GIRDER_RTD }>
                  { S }User Guide
                </a>
                { S }to learn the basics of how to use the application.  To
                browse the data hosted on this server, start on the
                <a className="g-collections-link">
                  { S }Collections
                </a>
                { S }page.  If you want to search for specific data on this
                server, use the
                <a className="g-quicksearch-link">
                  { S }Quick Search
                </a>
                { S }box at the top of the screen.  Developers who want to use
                the Girder REST API should check out the
                <a href={ this.props.apiRoot }>
                  { S }interactive web API docs
                </a>
                .
              </p>
              {(
                  this.props.user
                ? <p className="g-frontpage-paragraph">
                    You are currently logged in as
                    <b> { this.props.user }</b>.  You can view your
                    <a className="g-my-folders-link">
                      { S }personal data space
                    </a>
                    { S }or go to your
                    <a className="g-my-account-link">
                      { S }user account page
                    </a>
                    .
                  </p>

                : <p className="g-frontpage-paragraph">
                    You are currently browsing anonymously.  If you want to
                    create a user account on this server, click the
                    <a className="g-register-link">
                      { S }Register
                    </a>
                    { S }link in the upper right corner.  If you already have a
                    user name, click the
                    <a className="g-login-link">
                      { S }Log In
                    </a>
                    { S }link.  Otherwise, you will only be able to see
                    publicly visible data in the system.
                  </p>
              )}
            </div>
        );
    }
}

