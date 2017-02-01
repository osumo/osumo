import React from 'react';

import TextField from '../../../common/text-field.jsx';

class Field extends React.Component {
  render () {
    let {
      state,
      onStateChange
    } = this.props;

    return (
      <TextField
        className='form-control'
        value={state.value || ''}
        onChange={(value) => onStateChange({ value })}
        key={'form-control'}
      />
    );
  }

  static get propTypes () {
    return {
      state: React.PropTypes.object,
      onStateChange: React.PropTypes.func
    };
  }
}

export default Field;
