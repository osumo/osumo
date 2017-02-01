import React from 'react';
import TextField from '../../../common/text-field.jsx';

class FileSelection extends React.Component {
  render () {
    let {
      onFileSelect,
      // options,
      state
    } = this.props;

    // options = options || {};

    /* TODO(opadron): add selected file history to spec */
    /*
     * let {selectedFiles} = options;
     * selectedFiles = selectedFiles || [
     * { id: 0, name: 'one'},
     * { id: 1, name: 'two'},
     * { id: 2, name: 'three'}
     * ];
     */

    let { path } = state;
    let buttons = [
      <button
        key='file-select'
        type='button'
        className='btn btn-primary'
        onClick={onFileSelect}
      >
        <span className='icon icon-folder-open' />
      </button>,

      <button
        key='dropdown'
        type='button'
        className='btn btn-info dropdown-toggle'
        data-toggle='dropdown'
      >
        <span className='caret' />
        <span className='sr-only'>Toggle Dropdown</span>
      </button>
    ];

    /* TODO(opadron): add "recently chosen" dropdown */
    buttons.pop();

    /*
     * TODO(opadron): this will go after
     * ... { buttons } ...
     *
     *    <ul className='dropdown-menu'>
     *      {selectedFiles.map(({ id, name }) => (
     *        <li key={ id }>
     *          <a onClick={(e) => e.preventDefault()}>{ name }</a>
     *        </li>
     *      ))}
     *    </ul>
     */

    return (
      <div
        className='input-group control-file-select'
        key='control-file-select'
      >
        <TextField
          className='form-control'
          value={path}
          onChange={function () { this.preventDefault(); }}
        />
        <div className='input-group-btn'>{buttons}</div>
      </div>
    );
  }

  static get propTypes () {
    return {
      options: React.PropTypes.object,
      state: React.PropTypes.object
    };
  }
}

export default FileSelection;
