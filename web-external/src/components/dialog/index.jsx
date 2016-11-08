import React from 'react';
import Group from '../common/group';

class Dialog extends React.Component {
  render () {
    let { backupKey, children, enabled, filterKey, onClose } = this.props;

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
             backupKey={ backupKey }
             filterKey={ filterKey }
             style={ style }
             onlyMatching={ true }
             onKeyDown={ onKeyDown }>
        { children }
      </Group >
    );
  }

  static get propTypes () {
    return {
      backupKey: React.PropTypes.string,
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
