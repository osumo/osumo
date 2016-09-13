import React from 'react';
import { isArray, isFunction, isNull, isUndefined } from 'underscore';

class Group extends React.Component {
  render () {
    let {
      children,
      filterKey,
      onChildClick,
      onlyMatching,
      root,
      ...props
    } = this.props;

    if (!root) {
      root = (<div {...props}/>);
    }

    if (isNull(children)) {
      children = [];
    }

    if (!isArray(children)) {
      children = [children];
    }

    if (onlyMatching && !isNull(filterKey) && !isUndefined(filterKey)) {
      children = children.filter((child) => child.props.groupKey === filterKey);
    }

    children = children.map((child) => React.cloneElement(
      child,
      {
        onClick: (
          isFunction(child.onClick)
          ? child.onClick
          : isFunction(onChildClick)
            ? () => onChildClick(child.props.groupKey)
            : null
        ),

        filterKey
      }
    ));

    return React.cloneElement(root, {}, children);
  }

  static get defaultProps () {
    return {
      onlyMatching: true
    };
  }

  static get propTypes () {
    return {
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ]),
      filterKey: React.PropTypes.string,
      onChildClick: React.PropTypes.func,
      onlyMatching: React.PropTypes.bool,
      root: React.PropTypes.element
    };
  }
}

export default Group;
