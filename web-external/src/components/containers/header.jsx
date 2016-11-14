import { connect } from 'react-redux';
import Header from '../header';

import actions from '../../actions';
import { router } from '../../globals';

const HeaderContainer = connect(
  ({
    loginInfo: { user: currentUser },
    header: { dropdownOpened }
  }) => ({ currentUser, dropdownOpened }),

  (dispatch) => ({
    onDropdown: actions.toggleHeaderDropdown,
    onFolders: (id) => router(`user/${id}`),
    onInfo: (id) => router(`useraccount/${id}/info`),
    onLogin: () => router('login'),
    onLogout: actions.submitLogoutForm,
    onRegister: () => router('register'),
    onTitle: () => router('')
  })
)(Header);

export default HeaderContainer;