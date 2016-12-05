import React from 'react';
import { isUndefined } from 'lodash';

import TextField from '../../../common/text-field.jsx';

class FileSelection extends React.Component {
  render () {
    let { name, description, foldersOnly, notes, options } = this.props;
    options = options || {};

    let { selectedFiles } = options;
    /* TODO(opadron): add selected file history to spec */
    selectedFiles = selectedFiles || [
      { id: 0, name: 'one'},
      { id: 1, name: 'two'},
      { id: 2, name: 'three'}
    ];

    let childComponents = [];

    if (!isUndefined(name)) {
      childComponents.push(
        <label className='control-label' key='control-label'>{ name }</label>
      );
    }

    if (!isUndefined(notes)) {
      childComponents.push(
        <div className='control-notes' key='control-notes'>{ notes }</div>)
    }

    childComponents.push(
      <div className='input-group control-file-select'
           key='control-file-select'>
        <input type='text' className='form-control'/>
        <div className='input-group-btn'>
          <button type='button'
                  className='btn btn-primary'
                  onClick={() => {
                    console.log('select file');
                    // actions.setItemSelectedCallback((item) => {
                    //   this.addOption(item);
                    //   actions.closeDialog();
                    // });
                    // router('file-select');
                  }}>
            fileDisplay
          </button>
          <button type='button'
                  className='btn btn-info dropdown-toggle'
                  data-toggle='dropdown'>
            <span className='caret'/>
            <span className='sr-only'>Toggle Dropdown</span>
          </button>
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

    return (
      !isUndefined(description)
        ?  (
          <div className='function-control'
               title={ description }>
            { childComponents }
          </div>
        )

        : (<div className='function-control'>{ childComponents }</div>)
    );
  }
}

export default FileSelection;
