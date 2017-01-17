import { connect } from 'react-redux';

import FileSelectorDialog from '../../dialog/file-selector';
import actions from '../../../actions';
import globals from '../../../globals';

const FileSelectorDialogContainer = connect(
  ({ dialog }) => {
    let { fileSelect } = dialog;
    fileSelect = fileSelect || {};
    let { modelType, root, folderSelectMode, showItems } = fileSelect;
    return {
      folder: root,
      parentType: modelType,
      showItems,
      folderSelectMode,
      itemFilter: globals.itemFilter
    };
  },

  (dispatch) => ({
    onClose: () => dispatch(actions.closeDialog()),
    onItemSelect: (item) => dispatch(actions.onItemSelect(item)),
    onRootSelect: (id, type) => dispatch(
      actions.setFileNavigationRoot(id, type)
    )
  })
)(FileSelectorDialog);

export default FileSelectorDialogContainer;
