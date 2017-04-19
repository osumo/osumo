import React from 'react';

import modes from './mode-constants';

class UploadDone extends React.Component {
  render () {
    let {
      mode,
      onReset,
      statusText
    } = this.props;

    let topClassNames = 'upload-done';

    if (mode !== modes.UPLOAD_DONE) {
      topClassNames = 'upload-done hidden';
    }

    const onClick = (e) => {
      e.preventDefault();
      onReset(e);
    };

    return (
      <div className={topClassNames}>
        {statusText}
        <br />
        <button
          className='upload-reset btn btn-lg btn-primary'
          onClick={onClick}
        >
          <i className='icon-upload' />Upload more files
        </button>
      </div>
    );
  }
}

export default UploadDone;
