import React from 'react';

import Header from '../common/header';
import Body from './body';

export default class FileSelector extends React.Component {
  render () {
    let { onClose, onFileSelect, folder, parentType } = this.props;

    return (
      <div className='modal-dialog'>
        <div className='modal-content'>
          <Header onClose={ onClose }>Select an item</Header>
          <Body folder={ folder }
                parentType={ parentType }
                onFileSelect={ onFileSelect }/>
        </div>
      </div>
    );
  }
}
