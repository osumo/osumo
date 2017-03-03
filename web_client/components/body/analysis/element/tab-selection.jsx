import React from 'react';
import ImageElement from './image';


class TabSelection extends React.Component {
  render () {
    let { name, mainAction, items } = this.props;

    return (
      <div>
        <ul className='nav nav-tabs'>
          {items.map((item, index) => (<li className={index === 0 ? 'active': ''}><a data-toggle='tab' href={'#' + index}>{item.name}</a></li>))}
        </ul>
        <div className='tab-content'>
          {items.map((item, index) => (

            <div id={index} className={index === 0? 'tab-pane fade in active': 'tab-pane fade'}>
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
      name: React.PropTypes.string,
      mainAction: React.PropTypes.string,
      items: React.PropTypes.arrayOf(React.PropTypes.Object)
    };
  }
}

export default TabSelection;
