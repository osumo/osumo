import React from 'react';

export default class FileSelector extends React.Component {
  render () {
    let {
      folder
    } = this.props;

    return <div className='fileselector'>
      <input type='button' onClick={(evt) => console.log(evt)} className='btn btn-primary' value='Select an item' />
    </div>;
  }
}
