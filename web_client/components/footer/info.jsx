import React from 'react';

import { COPYRIGHT } from '../../constants';

class Info extends React.Component {
  render () {
    return (
      <div className='g-footer-info'>
        { COPYRIGHT } The Ohio State University 2016<br />
        All Rights Reserved
      </div>
    );
  }
}

export default Info;
