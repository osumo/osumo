import React from 'react';
import { isNull } from 'lodash';
import $ from 'jquery';

import ItemModel from 'girder/models/ItemModel';

import { Promise } from '../../../utils/promise';
import objectReduce from '../../../utils/object-reduce';
import TextField from '../../common/text-field';
import { rest } from '../../../globals';
import './style.styl';

class Upload extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render () {
    let {
      browseText,
      currentlyUploading,
      doneUploading,
      fileDragEnabled,
      fileEntries,
      progress,
      progressGoal,
      statusText,
      subtitle,
      title,
      validationFailedMessage
    } = this.props;

    if (!browseText) {
      browseText = 'Click or Drag Here';
    }

    doneUploading = doneUploading || false;

    if (!fileEntries) {
      fileEntries = [];
    }

    if (!progress) {
      progress = 0;
    }

    if (!progressGoal) {
      progressGoal = 100;
    }

    let titleElement = [];
    if (title) {
      titleElement.push(
        <h4 className='g-upload-form-title' key='title'>{title}</h4>
      );
    }

    let subtitleElement = [];
    if (subtitle) {
      subtitleElement.push(
        <div className='g-upload-form-subtitle' key='subtitle'>
          <i className='icon-folder-open' />
          {subtitle}
        </div>
      );
    }

    const {
      onFileDragIn,
      onFileDragOut,
      onFileDragOver,
      onFileDrop,
      onFileClick,
      onFileChange,
      onNewFiles,
      onFileEntryTypeChange,
      onReset,
      removeFileEntry,
      updateFileEntryUploaded,
      onUploadSubmit
    } = this.props;

    let fileEntryWidgets = fileEntries.map((file, i) => (
      <li className='g-upload-entry' key={i.toString()}>
        <button
          className={
            'g-upload-entry-button btn btn-xs btn-danger' + (
              currentlyUploading ? ' disabled' : ''
            )
          }
          onClick={currentlyUploading ? null : (e) => { removeFileEntry(i); }}
        >
          <i className='icon-minus' />
        </button>
        <h4 className='g-upload-entry-name'>{file.name}</h4>
        <h4 className='g-upload-entry-type'>{file.type}</h4>
        <h4
          className={
            'g-upload-entry-tag' + (currentlyUploading ? '' : ' hidden')
          }
        >
          {file.metaType || ''}
        </h4>
        <input
          className={
            'g-upload-entry-tag' + (currentlyUploading ? ' hidden' : '')
          }
          list='types'
          onChange={
            ({ target: { value } }) => onFileEntryTypeChange(i, value)
          }
          placeholder='Content Type'
          type='search'
          value={file.metaType || ''}
        />
        <datalist className={currentlyUploading ? 'hidden' : ''} id='types'>
          <option key={'proteinX'} value={'proteinX'}>
            Protein Expression
          </option>
          <option key={'rawSequence'} value={'rawSequence'}>
            Raw Sequencing Data
          </option>
          <option key={'cprofile'} value={'cprofile'}>
            Clinical Profile
          </option>
          <option key={'dnaMeth'} value={'dnaMeth'}>
            DNA Methylation
          </option>
          <option key={'mrna'} value={'mrna'}>
            Gene Expression Quantification
          </option>
          <option key={'mirna'} value={'mirna'}>
            MircoRNA Quantification
          </option>
          <option key={'isoX'} value={'isoX'}>
            Osiform Expression Quantification
          </option>
          <option key={'exonJunction'} value={'exonJunction'}>
            Exon Junction Quantification
          </option>
          <option key={'exon'} value={'exon'}>
            Exon Quantification
          </option>
          <option key={'mrnaSummary'} value={'mrnaSummary'}>
            Gene Expression Summary
          </option>
          <option key={'none'} value={'none'}>
            - none/other -
          </option>
        </datalist>
        <div
          className={
            'progress progress-striped' + (
              currentlyUploading && !doneUploading
                ? ''
                : ' hide'
            )
          }
          style={{
            float: 'right',
            height: '10px',
            margin: '0px',
            marginRight: '3px',
            marginTop: '4px',
            width: '100px'
          }}
        >
          <div
            className='progress-bar progress-bar-info'
            role='progressbar'
            style={{
              height: '10px',
              width: (
                currentlyUploading && !doneUploading
                  ? `${Math.ceil(100 * file.uploaded / file.size)}%`
                  : '0px'
              ),
            }}
          />
        </div>
      </li>
    ));

    return (
      <form id='g-upload-form'>
        {titleElement}
        {subtitleElement}
        <div
          className={
            'upload-done' + (doneUploading ? '' : ' hidden')
          }
        >
          {statusText}
          <br />
          <button
            className='upload-reset btn btn-lg btn-primary'
            onClick={(e) => {
              e.preventDefault();
              onReset(e);
            }}
          >
            <i className='icon-upload' />Upload more files
          </button>
        </div>
        <div
          className={
            'g-nonmodal-upload-buttons-container' + (
              fileDragEnabled || doneUploading ? ' hidden' : ''
            )
          }
          style={{ marginTop: (currentlyUploading ? '50px' : '19px') }}
        >
          <button
            className={
              'g-start-upload btn btn-lg btn-primary' + (
                fileEntries.length === 0 ? ' disabled' : ''
              ) + (
                currentlyUploading ? ' hidden' : ''
              )
            }
            type='submit'
            style={{ float: 'left', margin: '0px' }}
            onClick={(e) => {
              e.preventDefault();
              if (fileEntries.length) {
                onUploadSubmit(fileEntries);
              }
            }}
          >
            <i className='icon-upload' />Start Upload
          </button>
        </div>
        <div
          className={
            'g-drop-zone' +
              (fileDragEnabled ? ' g-dropzone-show' : '') +
              (currentlyUploading || doneUploading ? ' hidden' : '')
          }
          style={{
            marginLeft: fileDragEnabled ? '0px' : '10px',
          }}
          onClick={(e) => {
            if (onFileClick) {
              onFileClick(e);
            }

            if (!e.defaultPrevented) {
              $(this.refs.fileInput).click();
            }
          }}
          onDragEnter={onFileDragIn}
          onDragLeave={onFileDragOut}
          onDragOver={onFileDragOver}
          onDrop={onFileDrop}
        >
          <i
            className={(fileDragEnabled ? 'icon-bullseye' : 'icon-docs')}
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
            onChange={(e) => {
              if (onFileChange) {
                onFileChange(e);
              }

              if (!e.defaultPrevented) {
                onNewFiles(this.refs.fileInput.files);
              }
            }}
          />
        </div>
        <div
          className={
            'g-overall-progress-message' + (
              doneUploading ? ' hidden' : ''
            )
          }
        >
          {statusText}
        </div>
        <div
          className={
            'g-progress-overall progress progress-striped' + (
              currentlyUploading
                ? ''
                : ' hide'
            )
          }
          style={{ height: '10px' }}
        >
          <div
            className='progress-bar progress-bar-info'
            role='progressbar'
            style={{
              width: (
                currentlyUploading
                  ? `${Math.ceil(100 * progress / progressGoal)}%`
                  : '0px'
              )
            }}
          />
        </div>
        <div className='g-upload-error-message g-validation-failed-message'>
          {currentlyUploading ? '' : validationFailedMessage}
        </div>
        <ul
          className={
            'g-upload-entry-list' + (
              doneUploading ? ' hidden' : ''
            )
          }
        >
          {fileEntryWidgets}
        </ul>
      </form>
    );
  }
}

class Wrapper extends React.Component {
  constructor() {
    super();
    this.reset();
  }

  reset () {
    this.state = {
      browseText: null,
      currentlyUploading: false,
      doneUploading: false,
      fileDragEnabled: false,
      fileEntries: [],
      progress: 0,
      progressGoal: 0,
      statusText: null,
      subtitle: 'Upload local data to SUMO',
      title: 'Upload Data',
      validationFailedMessage: null
    };
  }

  onReset (e) {
    this.reset();
    this.setState(this.state);
  }

  onFileDragIn (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.setState({
      browseText: 'Drop files here',
      fileDragEnabled: true
    });
  }

  onFileDragOut (e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      browseText: null,
      fileDragEnabled: false
    });
  }

  onFileDragOver (e) {
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

  onFileDrop (e) {
    e.stopPropagation();
    e.preventDefault();
    this.onNewFiles(e.dataTransfer.files);
    this.setState({
      browseText: null,
      fileDragEnabled: false
    });
  }

  onFileClick (e) {
    /* void */
  }

  onFileChange (e) {
    /* void */
  }

  onNewFiles (files) {
    let { fileEntries } = this.state;

    let newFiles = new Array(files.length);
    for(let i=0; i<files.length; ++i) {
      let { name, size, type } = files[i];
      newFiles[i] = {
        handle: files[i],
        metaType: null,
        name,
        size,
        type,
        uploaded: 0
      };
    }

    this.setState({
      fileEntries: fileEntries.concat(newFiles)
    });
  }

  onFileEntryTypeChange (index, type) {
    let { fileEntries } = this.state;

    let newFileEntries = fileEntries.map((e, j) => (
      index === j
        ? { ...e, metaType: type }
        : e
    ));

    this.setState({ fileEntries: newFileEntries });
  }

  removeFileEntry (index) {
    let { fileEntries } = this.state;

    let newFileEntries = fileEntries.filter((_, j) => (
      index !== j
    ));

    this.setState({ fileEntries: newFileEntries });
  };

  updateFileEntryUploaded (index, uploaded) {
    let { fileEntries } = this.state;
    fileEntries[index].uploaded = uploaded;
    this.setState({ fileEntries });
  };

  onUploadSubmit (fileEntries) {
    this.setState({ currentlyUploading: true });

    let totalWork = (
      fileEntries
        .map(({ handle: { size } }) => size)
        .reduce((a, b) => a + b, 0)
    );

    let currentWork = 0;

    this.setState({ progress: currentWork, progressGoal: totalWork });

    let actions = require('../../../actions');
    let { store } = require('../../../globals');
    let { Promise } = require('../../../utils/promise');
    let promise = (
      Promise.all(
        fileEntries.map(({ handle, type, uploaded }, index) => {
          let newlyUploaded = 0;

          return (
            (
              store.dispatch(actions.uploadFile(
                handle, {
                  callbacks: {
                    onChunk: (info) => {
                      let { bytes } = info;
                      currentWork += bytes;
                      newlyUploaded += bytes;
                      this.setState({ progress: currentWork });
                      this.updateFileEntryUploaded(index, uploaded + newlyUploaded);
                    }
                  }
                }
              ))

              .then(({ file }) => new Promise((resolve, reject) => {
                let mod = new ItemModel({ _id: file.attributes.itemId })
                let req = mod.fetch();
                req.done(() => { resolve(mod); });
                req.error(() => { reject(new Error()); });
              }))

              .then(
                (item) => [item, type]
              )
            )
          );
        })
      )

      .then((entries) => Promise.all(
        entries.map(([item, type]) => new Promise((resolve, reject) => {
          if (type) {
            item.addMetadata(
              'sumoDataType',
              type,
              () => resolve(item),
              () => reject(new Error())
            );
          } else {
            resolve(item);
          }
        }))
      ))

      .then(
        () => this.setState({
          currentlyUploading: false,
          doneUploading: true,
          fileEntries: [],
          statusText: 'Files uploaded successfully!'
        })
      )
    );
  }

  render () {
    return (
      <Upload
        { ...this.state }
        onFileDragIn={this.onFileDragIn.bind(this)}
        onFileDragOut={this.onFileDragOut.bind(this)}
        onFileDragOver={this.onFileDragOver.bind(this)}
        onFileDrop={this.onFileDrop.bind(this)}
        onFileClick={this.onFileClick.bind(this)}
        onFileChange={this.onFileChange.bind(this)}
        onNewFiles={this.onNewFiles.bind(this)}
        onFileEntryTypeChange={this.onFileEntryTypeChange.bind(this)}
        onReset={this.onReset.bind(this)}
        removeFileEntry={this.removeFileEntry.bind(this)}
        updateFileEntryUploaded={this.updateFileEntryUploaded.bind(this)}
        onUploadSubmit={this.onUploadSubmit.bind(this)}
      />
    );

  }
}

// export default Upload;
export default Wrapper;
