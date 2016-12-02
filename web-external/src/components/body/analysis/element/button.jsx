import React from 'react';
import { isUndefined } from 'lodash';

class Button extends React.Component {
  render () {
    let { name, action } = this.props;

    let displayText = name;
    let onClick;
    if (!isUndefined(action)) {
      displayText = `${ displayText }(${ action })`;
      onClick = (e) => (e.preventDefault(), console.log(action));
    }

    return (
      <button className='btn btn-default'
              onClick={ onClick }>
        { displayText }
      </button>
    );
  }
}

export default Button;
