import React from 'react';

import { COPYRIGHT } from '../../constants';

class Info extends React.Component {
  render () {
    return (
      <div className='g-footer-info'>
        { COPYRIGHT } 2016 - 2017 The Ohio State University<br />
        All Rights Reserved
      </div>
    );
  }
}

export default Info;
