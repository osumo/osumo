import React from 'react';
import TextField from '../../../common/text-field.jsx';

class FileSelection extends React.Component {
  render () {
    let {
      onFileSelect,
      state
    } = this.props;

    /* TODO(opadron): add selected file history to spec */
    /*
     * let {selectedFiles} = options;
     * selectedFiles = selectedFiles || [
     * { id: 0, name: 'one'},
     * { id: 1, name: 'two'},
     * { id: 2, name: 'three'}
     * ];
     */

    let { metaType, path } = state;
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

    let pathFieldStyle = {};
    let metaTypeFieldStyle = {};

    if (metaType) {
      pathFieldStyle = { marginRight: '-72px' };
      metaTypeFieldStyle = {
        background: '#bee7ff',
        border: '2px solid #89b4d8',
        borderRadius: '5px',
        color: 'darkblue',
        height: '29px',
        marginTop: '3px',
        overflow: 'hidden',
        padding: '0px',
        pointerEvents: 'none',
        textAlign: 'center',
        verticalAlign: 'middle',
        width: '70px',
        zIndex: '10'
      };
    }

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
          onChange={function () { this.preventDefault(); }}
          style={pathFieldStyle}
          value={path}
        />
        <TextField
          className={'form-control' + (metaType ? '' : ' hidden')}
          style={metaTypeFieldStyle}
          value={metaType}
        />
        <div className='input-group-btn'>{buttons}</div>
      </div>
    );
  }
}

export default FileSelection;
