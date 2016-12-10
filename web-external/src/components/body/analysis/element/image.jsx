import React from 'react';
import { isUndefined } from 'lodash';

import { apiRoot } from '../../../../globals';

class Image extends React.Component {
  render () {
    let { fileId, name, notes, src } = this.props;
    if (isUndefined(src)) {
      src = `${ apiRoot }/file/${ fileId }/download?image=.png`;
    }

    let elements = [];

    if (!isUndefined(name)) {
      elements.push(
        <label className='control-label'
               key={ 'control-label' }>
          { name }
        </label>
      );
    }

    if (!isUndefined(notes)) {
      elements.push(
        <div className='control-notes'
             key={ 'control-notes' }>
          { notes }
        </div>
      );
    }

    elements.push(
      <img src={ src } key={ 'form-control' }/>
    );

    return (<div>{ elements }</div>);
  }

  static get propTypes () {
    return {
      fileId: React.PropTypes.string,
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      src: React.PropTypes.string
    };
  }
}

export default Image;
