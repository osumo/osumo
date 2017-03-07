import React from 'react';

import modes from './mode-constants';

class UploadPanel extends React.Component {
  render() {
    let {
      browseText,
      mode,
      onFileClick,
      onFileDragIn,
      onFileDragOut,
      onFileDragOver,
      onNewFiles,
      onUpload,
      progress,
      progressGoal,
      statusText,
      uploadEnabled,
      validationFailedMessage
    } = this.props;

    browseText = browseText || '';
    mode = mode || modes.DEFAULT;
    progress = progress || 0;
    progressGoal = progressGoal || 0;
    statusText = statusText || '';
    uploadEnabled = uploadEnabled || false;
    validationFailedMessage = validationFailedMessage || '';

    let uploadButtonDivClasses = 'g-nonmodal-upload-buttons-container';
    let uploadButtonDivMarginTop = '19px';
    let uploadButtonClasses = 'g-start-upload btn btn-lg btn-primary';
    let onUploadButtonClick = (e) => {
      e.preventDefault();
      onUpload();
    };

    let fileSelectButtonClasses = 'g-drop-zone';
    let fileSelectButtonMarginLeft = '10px';
    let fileSelectIconClasses = 'icon-docs';

    let progressClasses = 'g-overall-progress-message';
    let progressBarClasses = (
      'g-progress-overall progress progress-striped hidden');

    let progressBarWidth = '0px';

    if (mode === modes.FILE_DRAGGING || mode === modes.UPLOAD_DONE) {
      uploadButtonDivClasses = 'g-nonmodal-upload-buttons-container hidden';
    }

    if (!uploadEnabled) {
      uploadButtonClasses = 'g-start-upload btn btn-lg btn-primary disabled';
      onUploadButtonClick = null;
    }

    if (mode === modes.UPLOADING) {
      uploadButtonDivMarginTop = '50px';
      uploadButtonClasses = 'g-start-upload btn btn-lg btn-primary hidden';
      progressBarClasses = 'g-progress-overall progress progress-striped';
      progressBarWidth = `${Math.ceil(100 * progress / progressGoal)}%`;
    }

    if (mode === modes.FILE_DRAGGING) {
      fileSelectButtonClasses = 'g-drop-zone g-dropzone-show';
      fileSelectButtonMarginLeft = '0px';
      fileSelectIconClasses = 'icon-bullseye';
    } else if(mode !== modes.DEFAULT) {
      fileSelectButtonClasses = 'g-drop-zone hidden';
    }

    if (mode === modes.UPLOAD_DONE) {
      progressClasses = 'g-overall-progress-message hidden';
    }

    const onFileSelectClick = (e) => {
      if (onFileClick) {
        onFileClick(e);
      }

      if (!e.defaultPrevented) {
        $(this.refs.fileInput).click();
      }
    };

    const onFileSelectDrop = (e) => {
      let files = e.dataTransfer.files;
      e.preventDefault();
      e.stopPropagation();
      onNewFiles(files);
    };

    const onFileSelectChange = (e) => {
      let files = this.refs.fileInput.files;
      e.preventDefault();
      e.stopPropagation();
      onNewFiles(files);
    };

    const _onFileDragIn = (e) => {
      if (onFileDragIn) {
        onFileDragIn(e);
      }

      if (!e.defaultPrevented) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const _onFileDragOut = (e) => {
      if (onFileDragOut) {
        onFileDragOut(e);
      }

      if (!e.defaultPrevented) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const _onFileDragOver = (e) => {
      if (onFileDragOver) {
        onFileDragOver(e);
      }

      if (!e.defaultPrevented) {
        let { dataTransfer } = e;
        if (!dataTransfer) {
          return;
        }

        e.preventDefault();
        let { effectAllowed } = dataTransfer;
        dataTransfer.dropEffect = (
          (effectAllowed === 'move' || effectAllowed === 'linkMove')
            ? 'move'
            : 'copy'
        );
      }
    };

    return (
      <div>
        <div
          className={uploadButtonDivClasses}
          style={{ marginTop: uploadButtonDivMarginTop }}
        >
          <button
            className={uploadButtonClasses}
            type='submit'
            style={{ float: 'left', margin: '0px' }}
            onClick={onUploadButtonClick}
          >
            <i className='icon-upload' />Start Upload
          </button>
        </div>
        <div
          className={fileSelectButtonClasses}
          style={{ marginLeft: fileSelectButtonMarginLeft }}
          onClick={onFileSelectClick}
          onDragEnter={_onFileDragIn}
          onDragLeave={_onFileDragOut}
          onDragOver={_onFileDragOver}
          onDrop={onFileSelectDrop}
        >
          <i
            className={fileSelectIconClasses}
            style={{ pointerEvents: 'none' }}
          />
          {browseText}
        </div>
        <div className='form-group hide'>
          <input
            id='g-files'
            type='file'
            multiple='multiple'
            ref='fileInput'
            onChange={onFileSelectChange}
          />
        </div>
        <div className={progressClasses}>
          {statusText}
        </div>
        <div className={progressBarClasses} style={{ height: '10px' }}>
          <div
            className='progress-bar progress-bar-info'
            role='progressbar'
            style={{ width: progressBarWidth }}
          />
        </div>
        <div className='g-upload-error-message g-validation-failed-message'>
          {validationFailedMessage}
        </div>
      </div>
    );
  }
}

export default UploadPanel;
