import React from 'react';
import { isNull } from 'lodash';
import $ from 'jquery';

import ItemModel from 'girder/models/ItemModel';

import { Promise } from '../../../utils/promise';
import objectReduce from '../../../utils/object-reduce';
import TextField from '../../common/text-field';
import { rest } from '../../../globals';

import FileEntry from './file-entry';
import UploadDone from './upload-done';
import UploadPanel from './panel';

import dataVarietyTable from './data-variety-table';
import modes from './mode-constants';
import './style.styl';

class Upload extends React.Component {
  render () {
    let {
      browseText,
      fileEntries,
      mode,
      progress,
      progressGoal,
      statusText,
      subtitle,
      title,
      validationFailedMessage,
      onFileDragIn,
      onFileDragOut,
      onFileDragOver,
      onFileClick,
      onNewFiles,
      onFileEntryTypeChange,
      onReset,
      onUploadSubmit,
      removeFileEntry,
      updateFileEntryUploaded
    } = this.props;

    if (!browseText) {
      browseText = 'Click or Drag Here';
    }

    if (!fileEntries) {
      fileEntries = [];
    }

    if (!mode) {
      mode = modes.DEFAULT;
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

    let fileEntryWidgets = fileEntries.map((file, i) => (
      <FileEntry
        key={i.toString()}
        metaType={file.metaType}
        mode={mode}
        name={file.name}
        onMetaTypeChange={(value) => onFileEntryTypeChange(i, value)}
        onRemove={() => removeFileEntry(i)}
        progress={file.uploaded}
        progressGoal={file.size}
        type={file.type}
      />
    ));

    return (
      <form id='g-upload-form'>
        {titleElement}
        {subtitleElement}
        <UploadDone
          mode={mode}
          onReset={onReset}
          statusText={statusText}
        />
        <UploadPanel
          browseText={browseText}
          mode={mode}
          onFileClick={onFileClick}
          onFileDragIn={onFileDragIn}
          onFileDragOut={onFileDragOut}
          onFileDragOver={onFileDragOver}
          onNewFiles={onNewFiles}
          onUpload={() => { onUploadSubmit(fileEntries); }}
          progress={progress}
          progressGoal={progressGoal}
          statusText={statusText}
          uploadEnabled={fileEntries.length !== 0}
          validationFailedMessage={validationFailedMessage}
        />
        <ul
          className={
            'g-upload-entry-list' + (
              mode === modes.UPLOAD_DONE ? ' hidden' : ''
            )
          }
        >
          {fileEntryWidgets}
        </ul>
      </form>
    );
  }
}

export default Upload;
