import React from 'react';
import { isNull } from 'lodash';
import $ from 'jquery';

import objectReduce from '../../../utils/object-reduce';
import TextField from '../../common/text-field';

class Upload extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render () {
    let {
      browseText,
      fileDragEnabled,
      fileEntries,
      noneSelectedText,
      subtitle,
      title,
      validationFailedMessage
    } = {
      ...this.props,
      ...(
        Object.entries(this.state)
          .filter(([_, v]) => !isNull(v))
          .reduce(objectReduce, {})
      )
    };

    if (!fileEntries) {
      fileEntries = [];
    }

    let titleElement = [];
    if (title) {
      titleElement.push(<h4 key='title'>{title}</h4>);
    }

    let subtitleElement = [];
    if (subtitle) {
      subtitleElement.push(
        <div className='g-dialog-subtitle' key='subtitle'>
          <i className='icon-folder-open' />
          {subtitle}
        </div>
      );
    }

    const onFileDragIn = (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.setState({
        browseText: 'WOAAAAAH!',
        fileDragEnabled: true
      });
    };

    const onFileDragOut = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        browseText: null,
        fileDragEnabled: false
      });
    };

    const onFileDragOver = (e) => {
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
    };

    const onFileDrop = (e) => {
      e.stopPropagation();
      e.preventDefault();
      onNewFiles(e.dataTransfer.files);
    };

    const onFileClick = (e) => {
      $(this.refs.fileInput).click();
    };

    const onFileChange = (e) => {
      onNewFiles(this.refs.fileInput.files);
    };

    const onNewFiles = (files) => {
      let newFiles = new Array(files.length);
      for(let i=0; i<files.length; ++i) {
        newFiles[i] = files[i];
      }

      this.setState({
        fileEntries: fileEntries.concat(newFiles)
      });
    };

    const onFileEntryTypeChange = (i, type) => {
      let newFileEntries = this.state.fileEntries.map((e, j) => (
        i === j
          ? { ...e, metaType: type }
          : e
      ));

      this.setState({ fileEntries: newFileEntries });
    };

    let fileEntryWidgets = fileEntries.map((file, i) => (
      <div className='g-file-upload-entry' key={i.toString()}>
        <button className='btn btn-xs btn-danger'>
          <i className='icon-minus' />
        </button>
        <h4>{file.name}</h4>
        <h4>{file.type}</h4>
        <select
          onChange={
            ({ target: { value } }) => onFileEntryTypeChange(i, value)
          }
          value={file.metaType || ''}
        >
          <option key={null      } value={''        }>- none -</option>
          <option key={'mrna'    } value={'mrna'    }>mRNA</option>
          <option key={'mirna'   } value={'mirna'   }>MicroRNA</option>
          <option key={'cprofile'} value={'cprofile'}>ClinicalProfile</option>
        </select>
      </div>
    ));

    return (
      <form id='g-upload-form'>
        {titleElement}
        {subtitleElement}
        <div
          className='g-drop-zone'
          onClick={onFileClick}
          onDragEnter={onFileDragIn}
          onDragLeave={onFileDragOut}
          onDragOver={onFileDragOver}
          onDrop={onFileDrop}
        >
          <i className={(fileDragEnabled ? 'icon-bullseye' : 'icon-docs')} />
          {browseText}
        </div>
        <div className='form-group hide'>
          <input
            id='g-files'
            type='file'
            multiple='multiple'
            ref='fileInput'
            onChange={onFileChange}
          />
        </div>
        {fileEntryWidgets}
        <div className='g-current-progress-message'/>
        <div className='g-progress-current progress progress-striped hide'>
          <div className='progress-bar progress-bar-info' role='progressbar'/>
        </div>
        <div className='g-overall-progress-message'>
          {noneSelectedText}
        </div>
        <div className='g-progress-overall progress progress-striped hide'>
          <div className='progress-bar progress-bar-info' role='progressbar'/>
        </div>
        <div className='g-upload-error-message g-validation-failed-message'>
          {validationFailedMessage}
        </div>
        <div className='g-nonmodal-upload-buttons-container'>
          <button
            className='g-start-upload btn btn-small btn-primary disabled'
            type='submit'
            onClick={(e) => { e.preventDefault(); }}
          >
            <i className='icon-upload' />Start Upload
          </button>
        </div>
      </form>
    );
  }
}

export default Upload;
