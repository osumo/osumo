import React from 'react';
import { connect } from 'react-redux';
import Dialog from '../../dialog';
import FileSelectorDialogContainer from './file-selector';
import LoginDialogContainer from './login';
import RegisterDialogContainer from './register';
import ResetPasswordDialogContainer from './reset-password';
import { closeDialog } from '../../../actions';

const DialogContainer = connect(
  ({
    dialog: { componentKey: filterKey }
  }) => ({ enabled: !!filterKey, filterKey }),

  (dispatch) => ({
    onClose: () => dispatch(closeDialog()),
    children: [
      <FileSelectorDialogContainer
        key='file-select'
        groupKey='file-select'
      />,
      <LoginDialogContainer key='login' groupKey='login' />,
      <RegisterDialogContainer key='register' groupKey='register' />,
      <ResetPasswordDialogContainer
        key='reset-password'
        groupKey='reset-password'
      />
    ]
  })
)(Dialog);

export default DialogContainer;
