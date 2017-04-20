import React from 'react';

class GirderItem extends React.Component {
  render () {
    let {
      downloadUrl,
      inlineUrl,
      name,
      size
    } = this.props;

    return (
      <div>
        <div
          className='g-item-list-entry'
          style={{
            borderRadius: 5,
            padding: 3,
            border: '1px solid lightgrey',
            maxWidth: 300,
            overflow: 'hidden',
            whiteSpace: 'nowrap'
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
            <i className='icon-doc-text-inv' />
            {name}
          </span>
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
