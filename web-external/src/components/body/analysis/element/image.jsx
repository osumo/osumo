import React from 'react';
import { isUndefined } from 'lodash';

import { apiRoot } from '../../../../globals';

class Image extends React.Component {
  render () {
    let { fileId, src } = this.props;
    if (isUndefined(src)) {
      src = `${ apiRoot }/file/${ fileId }/download?image=.png`;
    }

    return (<img src={ src } key={ 'form-control' }/>);
  }

  static get propTypes () {
    return {
      fileId: React.PropTypes.string,
      src: React.PropTypes.string
    };
  }
}

export default Image;
