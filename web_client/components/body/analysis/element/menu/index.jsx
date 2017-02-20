import React from 'react';
import { isUndefined } from 'lodash';
import '../../styles.styl';

class Menu extends React.Component{
  render(){
    //TODO define correct set of props to send
    let { action, name, items, state, onStateChange} = this.props;



    let onChangeState = (e) => {
        console.log("changed");
        console.log(state);
        let sendState = {name:e.target.value, value:e.target.value};
        onStateChange(sendState);
    };
    return (

      <select onChange={onChangeState} value={state.value}>
        {items.map((item) => (<option value={item}>{item}</option>))}
      </select>

    );
  }

  static get propTypes () {
    return {
      action: React.PropTypes.string,
      name: React.PropTypes.string,
      items: React.PropTypes.arrayOf(React.PropTypes.string),
      state: React.PropTypes.Object,
      onStateChange: React.PropTypes.func
    };
  }
}
export default Menu;
