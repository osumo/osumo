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
      fileDragEnabled,
      fileEntries,
      progress,
      progressGoal,
      statusText,
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

    const onFileDragIn = (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.setState({
        browseText: 'Drop files here',
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
      this.setState({
        browseText: null,
        fileDragEnabled: false
      });
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
        let { name, type } = files[i];
        newFiles[i] = {
          name,
          metaType: null,
          type,
          handle: files[i]
        };
      }

      this.setState({
        fileEntries: fileEntries.concat(newFiles)
      });
    };

    const onFileEntryTypeChange = (i, type) => {
      let newFileEntries = fileEntries.map((e, j) => (
        i === j
          ? { ...e, metaType: type }
          : e
      ));

      this.setState({ fileEntries: newFileEntries });
    };

    const removeFileEntry = (i) => {
      let newFileEntries = fileEntries.filter((_, j) => (
        i !== j
      ));

      this.setState({ fileEntries: newFileEntries });
    };

    const onUploadSubmit = (files) => {
      this.setState({ currentlyUploading: true });

      let totalWork = (
        files
          .map(([{ size }]) => size)
          .reduce((a, b) => a + b, 0)
      );

      let currentWork = 0;

      this.setState({ progress: currentWork, progressGoal: totalWork });

      let actions = require('../../../actions');
      let { store } = require('../../../globals');
      let { Promise } = require('../../../utils/promise');
      let promise = Promise.all(
        files.map(([file, type]) => (
          store.dispatch(actions.uploadFile(
            file, {
              callbacks: {
                onProgress: (info) => {
                  console.log(['PROGRESS', file, info]);
                },

                onChunk: (info) => {
                  let { bytes } = info;
                  currentWork += bytes;
                  this.setState({
                    progress: currentWork,
                    progressGoal: totalWork
                  });
                }
              }
            }
          )).then(({ file }) => new Promise((resolve, reject) => {
            let mod = new ItemModel({ _id: file.attributes.itemId })
            let req = mod.fetch();
            req.done(() => { resolve(mod); });
            req.error(() => { reject(new Error()); });
          })).then(
            (item) => [item, type]
          )
        ))
      ).then((entries) => Promise.all(
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
      )).then(
        () => Promise.delay(10000)
      ).then(
        () => console.log('UPLOADED! O___O')
      ).then(
        () => this.setState({
          currentlyUploading: false,
          fileEntries: []
        })
      );
    };

    let fileEntryWidgets = fileEntries.map((file, i) => (
      <li className='g-upload-entry' key={i.toString()}>
        <button
          className='g-upload-entry-button btn btn-xs btn-danger'
          onClick={(e) => { removeFileEntry(i); }}
        >
          <i className='icon-minus' />
        </button>
        <h4 className='g-upload-entry-name'>{file.name}</h4>
        <h4 className='g-upload-entry-type'>{file.type}</h4>
        <input
          className='g-upload-entry-tag'
          list="types"
          onChange={
            ({ target: { value } }) => onFileEntryTypeChange(i, value)
          }
          placeholder="Content Type"
          type="search"
          value={file.metaType || ''}
        />
        <datalist id="types">
          <option
            key={'proteinX'}
            value={'proteinX'}
          >
            Protein Expression
          </option>
          <option
            key={'rawSequence'}
            value={'rawSequence'}
          >
            Raw Sequencing Data
          </option>
          <option key={'cprofile'} value={'cprofile'}>
            Clinical Profile
          </option>
          <option
            key={'dnaMeth'}
            value={'dnaMeth'}
          >
            DNA Methylation
          </option>
          <option
            key={'mrna'}
            value={'mrna'}
          >
            Gene Expression Quantification
          </option>
          <option
            key={'mirna'}
          value={'mirna'}
          >
            MircoRNA Quantification
          </option>
          <option
            key={'isoX'}
            value={'isoX'}
          >
            Osiform Expression Quantification
          </option>
          <option
            key={'exonJunction'}
            value={'exonJunction'}
          >
            Exon Junction Quantification
          </option>
          <option
            key={'exon'}
            value={'exon'}
          >
            Exon Quantification
          </option>
          <option
            key={'mrnaSummary'}
            value={'mrnaSummary'}
          >
            Gene Expression Summary
          </option>
          <option
            key={'none'}
            value={'none'}
          >
            - none/other -
          </option>
        </datalist>
      </li>
    ));

    return (
      <form id='g-upload-form'>
        {titleElement}
        {subtitleElement}
        <div
          className={
            'g-nonmodal-upload-buttons-container' + (
              fileDragEnabled ? ' hidden' : ''
            )
          }
          style={{ marginTop: '19px' }}
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
                onUploadSubmit(
                  fileEntries.map(({ handle, metaType }) => [handle, metaType])
                );
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
              (currentlyUploading ? ' hidden' : '')
          }
          style={{
            marginLeft: fileDragEnabled ? '0px' : '10px',
          }}
          onClick={onFileClick}
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
            onChange={onFileChange}
          />
        </div>
        <div className='g-overall-progress-message'>
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
        <ul className='g-upload-entry-list'>
          {fileEntryWidgets}
        </ul>
      </form>
    );
  }
}

export default Upload;
