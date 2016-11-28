import React from 'react';
import ReactDOM from 'react-dom';

class TextField extends React.Component {
  constructor () {
    super();
    this.state = this.state || {};
    this.state.lastFocusTime = null;
  }

  handleFocus () {
    let { focusTime } = this.props;
    if (this.state.lastFocusTime < focusTime ||
        (!(this.state.lastFocusTime) && focusTime)) {
      this.setState({ lastFocusTime: focusTime });
      ReactDOM.findDOMNode(this.refs.input).focus();
    }
  }

  componentDidMount () {
    this.handleFocus();
  }

  componentDidUpdate () {
    this.handleFocus();
  }

  render () {
    let { children, onChange, value, ...props } = this.props;
    delete props.focusTime;
    delete props.defaultValue;

    const updateCallback = (event) => (
      onChange
        ? onChange.apply(
            event,
            [event.target.value]
          )
        : null
    );

    return (
      <input { ...props }
             onChange={ updateCallback }
             value={ value || '' }
             ref='input'>
        { children }
      </input>
    );
  }

  static get propTypes () {
    return {
      onChange: React.PropTypes.func,
      children: React.PropTypes.node,
      focusTime: React.PropTypes.object,
      value: React.PropTypes.string
    };
  }
}

export default TextField;
