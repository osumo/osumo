import React from 'react';

class TabGroup extends React.Component {
  render () {
    let { children, state, onStateChange } = this.props;

    children = children || [];

    let { activeIndex } = state;
    activeIndex = activeIndex || 0;

    const onTabClick = (index) => (e) => {
      e.preventDefault();
      onStateChange({ activeIndex: index });
    };

    let tabElements = (
      children.map((child, index) => {
        let className = '';
        if (index === activeIndex) {
          className = 'active';
        }

        let { name, elementKey: key, id } = child.props;
        name = name || key || `anon-${id}`;

        return (
          <li className={className} key={`tab-${index}`}>
            <a data-toggle='tab' onClick={onTabClick(index)}>
              {name}
            </a>
          </li>
        );
      })
    );

    let contentElements = (
      children.map((child, index) => {
        let className = 'tab-pane fade';
        if (index === activeIndex) {
          className = 'tab-pane fade in active';
        }

        return (
          <div
            key={`tab-content-${index}`}
            className={className}
          >
            {child}
          </div>
        );
      })
    );

    return (
      <div>
        <ul className='nav nav-tabs'>
          {tabElements}
        </ul>
        <div className='tab-content'>
          {contentElements}
        </div>
      </div>
    );
  }
}

export default TabGroup;
