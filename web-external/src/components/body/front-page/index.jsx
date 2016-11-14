import React from 'react';

const content = {
  __html: require('raw!./marketing.html')
};

class Marketing extends React.Component {
  render () {
    return <div dangerouslySetInnerHTML={content} />;
  }
}

export default Marketing;
