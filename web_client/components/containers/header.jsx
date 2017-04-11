import { connect } from 'react-redux';
import Header from '../header';

import actions from '../../actions';

const HeaderContainer = connect(
  ({
    loginInfo: {
      user: currentUser,
      anonymous
    },
    header: { dropdownOpened }
  }) => ({ currentUser, dropdownOpened, anonymous }),

  (dispatch) => ({
    onDropdown: () => dispatch(actions.toggleHeaderDropdown()),
    onFolders: (id) => window.open(`girder#user/${id}`, '_blank'),
    onInfo: (id) => window.open(`girder#useraccount/${id}/info`, '_blank'),
    onLogin: () => dispatch(actions.openLoginDialog()),
    onLogout: () => dispatch(actions.submitLogoutForm()),
    onRegister: () => dispatch(actions.openRegisterDialog()),
    onTitle: () => dispatch(actions.setGlobalNavTarget(''))
  })
)(Header);

export default HeaderContainer;
