import React from 'react';
import { formatSize } from 'girder/misc';

class GirderItem extends React.Component {
  render () {
    let {
      item,
      onStateChange,
      onItemSave,
      state = {}
    } = this.props;

    let {
      doSelect = false,
      value: nameText = '',
      savedItem = null,
      saving = false
    } = state;

    if (savedItem) {
      item = savedItem;
      saving = false;
    }

    let downloadUrl = item.downloadUrl();
    let inlineUrl = item.downloadUrl({ contentDisposition: 'inline' });
    let name = item.name();
    let size = formatSize(item.get('size'));

    const savingOn = (e) => {
      e.preventDefault();
      onStateChange({
        doSelect: true,
        value: name,
        saving: true
      });
    };

    const savingOff = (e) => {
      e.preventDefault();
      onStateChange({
        value: '',
        saving: false
      });
    };

    const saveItem = (e) => {
      e.preventDefault();
      onItemSave(item, nameText);
    };

    if (saving) {
      return (
        <div
          style={{
            border: '1px solid lightgrey',
            borderRadius: 5,
            maxWidth: 300,
            overflow: 'hidden',
            padding: 3,
            whitespace: 'nowrap'
          }}
        >
          <div className='input-group'>
            <div className='input-group-btn'>
              <button
                className='btn btn-danger'
                onClick={savingOff}
                style={{
                  height: '1.5em',
                  width: '1.5em',
                  padding: 0,
                  margin: 0
                }}
                type='button'
              >
                <span className='icon icon-cancel' />
              </button>
            </div>
            <input
              style={{
                height: '1.5em',
                paddingLeft: '0.25em',
                margin: 0
              }}
              type='text'
              className='form-control'
              value={nameText}
              ref={(input) => {
                if (doSelect && input) {
                  input.focus();
                  input.select();
                }
              }}
              onChange={(e) => {
                onStateChange({
                  doSelect: false,
                  value: e.target.value
                });
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  saveItem(e);
                }
              }}
            />
            <div className='input-group-btn'>
              <button
                className='btn btn-success'
                onClick={(e) => {
                  e.preventDefault();
                  saveItem(e);
                }}
                style={{
                  height: '1.5em',
                  width: '1.5em',
                  padding: 0,
                  margin: 0
                }}
                type='button'
              >
                <span className='icon icon-ok' />
              </button>
            </div>
          </div>
        </div>
      );
    }

    let saveButton = [];
    if (savedItem) {
      saveButton = [
        <i
          key='save-button'
          className='icon-ok'
          style={{
            display: 'inline-block',
            marginLeft: 4,
            color: 'white',
            background: 'green',
            border: '1px solid green',
            borderRadius: 5
          }}
        />
      ];
    } else {
      saveButton = [
        <a
          key='save-button'
          onClick={savingOn}
          target='_blank'
          title='Save to OSUMO'
          rel='noopener noreferrer'
          style={{
            display: 'inline-block',
            marginLeft: 4,
            border: '1px solid',
            borderRadius: 5
          }}
        >
          <i className='icon-floppy' />
        </a>
      ];
    }

    return (
      <div>
        <div
          className='g-item-list-entry'
          style={{
            borderRadius: 5,
            padding: 3,
            border: (
              savedItem
                ? '1px solid rgba(0, 128, 0, 0.5)'
                : '1px solid lightgrey'
            ),
            maxWidth: 300,
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              width: 225,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
              float: 'left'
            }}
          >
            <span className='g-item-list-link'>
              <a
                href={downloadUrl}
                title='Download'
                style={{
                  display: 'inline-block',
                  border: '1px solid',
                  borderRadius: 5
                }}
              >
                <i className='icon-download' />
              </a>
              <a
                href={inlineUrl}
                target='_blank'
                title='View in browser'
                rel='noopener noreferrer'
                style={{
                  display: 'inline-block',
                  marginLeft: 4,
                  border: '1px solid',
                  borderRadius: 5
                }}
              >
                <i className='icon-eye' />
              </a>
              {saveButton}
              <i className='icon-doc-text-inv' />
              {name}
            </span>
          </div>
          <div
            className='g-item-size'
            style={{
              display: 'inline-block',
              float: 'right',
              color: '#808080',
              fontSize: 13,
              marginTop: 3
            }}
          >
            {size}
          </div>
        </div>
      </div>
    );
  }
}

export default GirderItem;
