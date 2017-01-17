import React from 'react';
import { isUndefined } from 'lodash';

class Button extends React.Component {
  render () {
    let { action, name, mainAction, onAction } = this.props;

    action = action || mainAction;

    let displayText = name;
    let onClick;
    if (!isUndefined(action)) {
      displayText = `${ displayText } (${ action })`;
      onClick = (e) => (e.preventDefault(), onAction(action));
    }

    return (
      <button className='btn btn-default'
              onClick={ (e) => {
                e.preventDefault();
                onAction(action);
              } }>
        { displayText }
      </button>
    );
  }

  static get propTypes () {
    return {
      action: React.PropTypes.string,
      name: React.PropTypes.string,
      mainAction: React.PropTypes.string,
      onAction: React.PropTypes.func
    };
  }
}

export default Button;
