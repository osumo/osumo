import React from 'react';
import ImageElement from './image';
import { isUndefined } from 'lodash';

class TabSelection extends React.Component {
  render () {
    let { action, name, mainAction, onAction, items } = this.props;

    action = action || mainAction;

    let displayText = name;

    return (
      <div>
        <ul className='nav nav-tabs'>
          {items.map((item, index) => (<li className={index===0? 'active': ''}><a data-toggle='tab' href={'#' + index}>{item.name}</a></li>))}
        </ul>
        <div className='tab-content'>
          {items.map((item, index) => (

            <div id={index} className={ index===0? 'tab-pane fade in active': 'tab-pane fade'}>
              <div className='task-notes'>{ item.notes }</div>
              <ImageElement key='result' fileId={item.fileId} />
            </div>
          )
        )}
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      action: React.PropTypes.string,
      name: React.PropTypes.string,
      mainAction: React.PropTypes.string,
      onAction: React.PropTypes.func,
      items: React.PropTypes.arrayOf(React.PropTypes.Object)
    };
  }
}

export default TabSelection;
