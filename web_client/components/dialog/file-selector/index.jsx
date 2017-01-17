import React from 'react';

import Header from '../common/header';
import Body from './body';

export default class FileSelector extends React.Component {
  render () {
    let {
      folderSelectMode,
      itemFilter,
      onClose,
      onItemSelect,
      onRootSelect,
      showItems,
      folder,
      parentType
    } = this.props;

    return (
      <div className='modal-dialog'>
        <div className='modal-content'>
          <Header onClose={ onClose }>Select an item</Header>
          <Body folder={ folder }
                itemFilter={ itemFilter }
                folderSelectMode={ folderSelectMode }
                onItemSelect={ onItemSelect }
                onRootSelect={ onRootSelect }
                showItems={ showItems }
                parentType={ parentType }/>
        </div>
      </div>
    );
  }
}
