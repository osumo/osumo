import React from 'react';
import { isUndefined } from 'lodash';

import TextField from '../../../common/text-field.jsx';

class Field extends React.Component {
  render () {
    let {
      name,
      notes,
      state,
      onStateChange
    } = this.props;

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
      <TextField className='form-control'
                 value={ state.value || '' }
                 onChange={ (value) => onStateChange({ value }) }
                 key={ 'form-control' }/>
    );

    return (<div>{ elements }</div>);
  }

  static get propTypes () {
    return {
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      state: React.PropTypes.object,
      onStateChange: React.PropTypes.func
    };
  }
}

export default Field;
