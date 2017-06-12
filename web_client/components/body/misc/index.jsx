import React from 'react';
import { isString } from 'lodash';

import Group from '../../common/group';
import AppLog from './app-log';
import OutputHistory from './output-history';

const wrapComponent = (component, propsToFilterOut) => {
  class Result extends React.Component {
    render () {
      let { ...props } = this.props;
      propsToFilterOut.forEach((prop) => { delete props[prop]; });

      if (isString(component)) {
        let { children = [] } = props;
        delete props.children;
        return React.createElement(component, props, children);
      }

      return <component {...props} />;
    }
  };

  return Result;
};

const BAD_PROPS = ['groupKey', 'filterKey'];
const Li = wrapComponent('li', BAD_PROPS);
const Div = wrapComponent('div', BAD_PROPS);

const STATIC_CHILD_TABLE = [
  { key: 'log', name: 'Application Log', component: AppLog },
  { key: 'history', name: 'Intermediate Results', component: OutputHistory }
];

const getChildElements = (filterKey) => STATIC_CHILD_TABLE
  .map(({key, component: Component}) => {
    let className = 'tab-pane fade';
    if (key === filterKey) {
      className = 'tab-pane fade in active';
    }

    const style = {
      padding: 10,
      border: '1px solid lightgrey',
      borderTop: 'none',
      height: '75vh',
      overflow: 'auto',
      borderRadius: 5,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0
    };

    return <Div
      key={`tab-content-${key}`}
      groupKey={key}
      className={className}
      style={style}
    >
      <Component />
    </Div>;
  });



const getChildTabs = (filterKey, onTabCallback) => STATIC_CHILD_TABLE
  .map(({key, name, component}) => {
    let className = '';
    if (key === filterKey) {
      className = 'active';
    }

    return <Li key={`tab-${key}`} className={className}>
      <a onClick={(e) => onTabCallback(key)}>
        <h4>
            { name }
        </h4>
      </a>
    </Li>;
  });

class Misc extends React.Component {
  render () {
    let {
      onTabClick,
      tabKey
    } = this.props;

    const headerRoot = <ul className='nav nav-tabs' />;

    return <div>
      <Group
        filterKey={tabKey}
        onlyMatching={false}
        root={headerRoot}
      >
        {getChildTabs(tabKey, onTabClick)}
      </Group>
      <Group
        className='tab-content'
        filterKey={tabKey}
        onlyMatching={true}
      >
        {getChildElements(tabKey)}
      </Group>
    </div>;
  }
}

export default Misc;
