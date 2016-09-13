import React from 'react';
import Group from '../common/group';

class Dialog extends React.Component {
  render () {
    let { children, enabled, filterKey, onClose } = this.props;

    let className = (enabled ? 'modal fade in' : 'modal fade');
    let style = (enabled ? { display: 'block' } : { display: 'none' });

    /* closes dialog on ESC */
    const onKeyDown = (event) => {
      if (event.keyCode === 27) {
        event.preventDefault();
        onClose();
      }
    };

    return (
      <Group className={ className }
             id='g-dialog-container'
             filterKey={ filterKey }
             style={ style }
             onKeyDown={ onKeyDown }>
        { children }
      </Group >
    );
  }

  static get propTypes () {
    return {
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ]),
      enabled: React.PropTypes.bool,
      filterKey: React.PropTypes.string,
      onClose: React.PropTypes.func
    };
  }
}

export default Dialog;
