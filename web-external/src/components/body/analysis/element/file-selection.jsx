import React from 'react';
import { isUndefined } from 'lodash';

import TextField from '../../../common/text-field.jsx';

class FileSelection extends React.Component {
  render () {
    let {
      description,
      foldersOnly,
      name,
      notes,
      onFileSelect,
      onStateChange,
      options,
      state
    } = this.props;

    options = options || {};

    let { selectedFiles } = options;
    /* TODO(opadron): add selected file history to spec */
    selectedFiles = selectedFiles || [
      { id: 0, name: 'one'},
      { id: 1, name: 'two'},
      { id: 2, name: 'three'}
    ];

    let { path, value } = state;
    let buttons = [
      (
        <button key='file-select'
                type='button'
                className='btn btn-primary'
                onClick={ onFileSelect }>
          <span className='icon icon-folder-open'/>
        </button>
      ),
      (
        <button key='dropdown'
                type='button'
                className='btn btn-info dropdown-toggle'
                data-toggle='dropdown'>
          <span className='caret'/>
          <span className='sr-only'>Toggle Dropdown</span>
        </button>
      )
    ];

    if (foldersOnly) {
      buttons[0] = (
        <button key='file-select'
                type='button'
                className='btn btn-danger'
                onClick={ (e) => e.preventDefault() }>
          <span className='icon icon-folder-open'/>
        </button>
      );
    }

    return (
      <div className='input-group control-file-select'
           key='control-file-select'>
        <TextField className='form-control'
                   value={ foldersOnly ? value : path }
                   onChange={(
                    foldersOnly
                      ? (value) => onStateChange({ value })
                      : function() { this.preventDefault(); }
                   )}/>
        <div className='input-group-btn'>
          { buttons }
          <ul className='dropdown-menu'>
            {selectedFiles.map(({ id, name }) => (
              <li key={ id }>
                <a onClick={(e) => e.preventDefault()}>{ name }</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      description: React.PropTypes.string,
      foldersOnly: React.PropTypes.bool,
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      onStateChange: React.PropTypes.func,
      options: React.PropTypes.object,
      state: React.PropTypes.object
    };
  }
}

export default FileSelection;
