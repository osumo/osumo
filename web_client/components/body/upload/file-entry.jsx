import React from 'react';
import modes from './mode-constants';
import { elements as dataVarietyElements } from './data-variety-table';

class FileEntry extends React.Component {
  render () {
    let {
      metaType,
      mode,
      name,
      onMetaTypeChange,
      onRemove,
      progress,
      progressGoal,
      type
    } = this.props;

    metaType = metaType || '';
    mode = mode || modes.DEFAULT;
    name = name || '';
    progress = progress || 0;
    progressGoal = progressGoal || 0;
    type = type || '';

    let buttonClasses = 'g-upload-entry-button btn btn-xs btn-danger';
    let onButtonClick = onRemove;
    let tagDisplayClasses = 'g-upload-entry-tag hidden';
    let tagSelectClasses = 'g-upload-entry-tag';
    let uploadProgressClasses = 'progress progress-striped hidden';
    let progressBarWidth = '0px';

    if (mode === modes.UPLOADING) {
      buttonClasses = 'g-upload-entry-button btn btn-xs btn-danger disabled';
      onButtonClick = null;
      tagDisplayClasses = 'g-upload-entry-tag';
      tagSelectClasses = 'g-upload-entry-tag hidden';
      uploadProgressClasses = 'progress progress-striped';

      progressBarWidth = `${Math.ceil(100 * progress / progressGoal)}%`;
    }

    let dataListClasses = 'hidden';
    if (mode === modes.DEFAULT || mode === modes.FILE_DRAGGING) {
      dataListClasses = '';
    }

    const progressBarStyle = {
      float: 'right',
      height: '10px',
      margin: '0px',
      marginRight: '3px',
      marginTop: '4px',
      width: '150px'
    };


    return (
      <li className='g-upload-entry'>
        <button className={buttonClasses} onClick={onButtonClick}>
          <i className='icon-minus' />
        </button>
        <h4 className='g-upload-entry-name'>{name}</h4>
        <h4 className='g-upload-entry-type'>{type}</h4>
        <h4 className={tagDisplayClasses}>{metaType}</h4>
        <input
          className={tagSelectClasses}
          list='types'
          onChange={(e) => { onMetaTypeChange(e.target.value); }}
          placeholder='Content Type'
          type='search'
          value={metaType}
        />
        <datalist className={dataListClasses} id='types'>
          {dataVarietyElements}
        </datalist>

        <div className={uploadProgressClasses} style={progressBarStyle}>
          <div
            className='progress-bar progress-bar-info'
            role='progressbar'
            style={{ height: '10px', width: progressBarWidth }}
          />
        </div>
      </li>
    );
  }
}

export default FileEntry;
