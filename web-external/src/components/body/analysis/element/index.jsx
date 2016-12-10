import React from 'react';

import ButtonElement from './button';
import FieldElement from './field';
import FileSelectionElement from './file-selection';
import ImageElement from './image';

class Element extends React.Component {
  render () {
    let {
      id,
      type,
      state,
      onAction,
      onFileSelect,
      onStateChange,
      ...props
    } = this.props;

    let result;

    switch (type) {
      case 'button':
        result = (<ButtonElement onAction={ onAction } { ...props }/>);
        break;

      case 'field':
        result = (
          <FieldElement onStateChange={ onStateChange }
                        state={ state }
                        { ...props }/>
        );
        break;

      case 'fileSelection':
      case 'file_selection':
        result = (
          <FileSelectionElement onStateChange={ onStateChange }
                                onFileSelect={ onFileSelect }
                                state={ state }
                                { ...props }/>
        );
        break;

      case 'folderSelection':
      case 'folder_selection':
        result = (
          <FileSelectionElement onStateChange={ onStateChange }
                                onFileSelect={ onFileSelect }
                                state={ state }
                                { ...props }
                                foldersOnly={ true }/>
        );
        break;

      case 'image':
        result = (<ImageElement { ...props }/>);
        break

      default:
        result = (
          <div className='.g-analysis-element'>
            { id }
            { JSON.stringify(this.props) }
          </div>
        );
    }

    return result;
  }

  static get propTypes () {
    return {
      id: React.PropTypes.number,
      onAction: React.PropTypes.func,
      onFileSelect: React.PropTypes.func,
      onStateChange: React.PropTypes.func,
      state: React.PropTypes.object,
      type: React.PropTypes.string
    };
  }
}

export default Element;
