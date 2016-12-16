import { connect } from 'react-redux';

import FileSelectorDialog from '../../dialog/file-selector';
import actions from '../../../actions';

const FileSelectorDialogContainer = connect(
  ({ dialog }) => {
    let { fileNavigation } = dialog;
    fileNavigation = fileNavigation || {};

    let { modelType, root } = fileNavigation;
    return { folder: root, parentType: modelType };
  },

  (dispatch) => ({
    onClose: () => dispatch(actions.closeDialog()),
    onFileSelect: (item) => dispatch(actions.onItemSelect(item))
  })
)(FileSelectorDialog);

export default FileSelectorDialogContainer;
