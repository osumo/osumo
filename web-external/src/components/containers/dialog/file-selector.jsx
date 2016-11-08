import { connect } from 'react-redux';

import FileSelectorDialog from '../../dialog/file-selector';
import actions from '../../../actions';
import { router } from '../../../globals';

const FileSelectorDialogContainer = connect(
  ({
    dialog: {
      currentFolder: folder,
      currentFolderParentType: parentType
    }
  }) => ({ folder, parentType }),

  (dispatch) => ({
    onClose: () => actions.closeDialog(),
    onFileSelect: (item) => actions.onItemSelect(item)
  })
)(FileSelectorDialog);

export default FileSelectorDialogContainer;
