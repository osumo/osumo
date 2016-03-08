import React from 'react';
import { partial } from 'underscore';

import { ABOUT_URL as GIRDER_RTD, NBSP as S } from '../../constants';

export default class Body extends React.Component {
  render () {
    let {
      apiRoot,
      currentUser,
      onCollections,
      onQuickSearch,
      onFolders,
      onInfo,
      onRegister,
      onLogin
    } = this.props;

    let userContent;

    if (currentUser) {
      let id = currentUser._id;

      onFolders = partial(onFolders, id);
      onInfo = partial(onInfo, id);

      userContent = (
        <p className='g-frontpage-paragraph'>
          You are currently logged in as
          <b> { currentUser.login }</b>.  You can view your
          <a className='g-my-folders-link'
             onClick={ onFolders }>
            { S }personal data space
          </a>
          { S }or go to your
          <a className='g-my-account-link'
             onClick={ onInfo }>
            { S }user account page
          </a>
          .
        </p>
      );
    } else {
      userContent = (
        <p className='g-frontpage-paragraph'>
          You are currently browsing anonymously.  If you want to create
          a user account on this server, click the
          <a className='g-register-link'
             onClick={ onRegister }>
            { S }Register
          </a>
          { S }link in the upper right corner.  If you already have a
          user name, click the
          <a className='g-login-link'
             onClick={ onLogin }>
            { S }Log In
          </a>
          { S }link.  Otherwise, you will only be able to see publicly
          visible data in the system.
        </p>
      );
    }

    return (
      <div className='g-frontpage-body'>
        <p className='g-frontpage-paragraph'>
          <b>Welcome to Girder!</b>
          { S }If this is your first time here, you might want to check
          out the
          <a target='_blank' href={ GIRDER_RTD }>
            { S }User Guide
          </a>
          { S }to learn the basics of how to use the application.  To
          browse the data hosted on this server, start on the
          <a className='g-collections-link'
             onClick={ onCollections }>
            { S }Collections
          </a>
          { S }page.  If you want to search for specific data on this
          server, use the
          <a className='g-quicksearch-link'
             onClick={ onQuickSearch }>
            { S }Quick Search
          </a>
          { S }box at the top of the screen.  Developers who want to use
          the Girder REST API should check out the
          <a href={ apiRoot }>
            { S }interactive web API docs
          </a>
          .
        </p>
        { userContent }
      </div>
    );
  }
}
