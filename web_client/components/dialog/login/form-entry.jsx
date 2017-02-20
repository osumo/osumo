import React from 'react';
import TextField from '../../common/text-field';

class FormEntry extends React.Component {
  render () {
    let {
      id,
      children,
      focusTime,
      groupId,
      type,
      placeholder,
      className,
      onChange,
      value
    } = this.props;

    if (className) {
      let classes = new Set(className.split(' ').filter(s => s.length));
      classes.add('form-group');
      className = (() => {
        let tmp = new Array(classes.size);
        let counter = 0;
        classes.forEach((klass) => { tmp[counter++] = klass; });
        return tmp;
      })().join(' ');
    } else {
      className = 'form-group';
    }

    return (
      <div className={className} id={groupId}>
        <label className='control-label' htmlFor={id}>
          {children}
        </label>
        <TextField
          className='input-sm form-control'
          id={id}
          focusTime={focusTime}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }

  static get defaultProps () {
    return {
      type: 'text',
      className: null
    };
  }

  static get propTypes () {
    return {
      id: React.PropTypes.string,
      children: React.PropTypes.string,
      focusTime: React.PropTypes.object,
      groupId: React.PropTypes.string,
      type: React.PropTypes.string,
      placeholder: React.PropTypes.string,
      className: React.PropTypes.string,
      onChange: React.PropTypes.func,
      value: React.PropTypes.string
    };
  }
}

export default FormEntry;
