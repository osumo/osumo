import React from 'react';
import { isArray, isFunction, isNull, isUndefined } from 'underscore';

/**
 * utility function for filtering child components
 *
 * returns a subset of the child components in children, and the effective key
 * by which the subset was chosen.  The included child components are those who
 * have a groupKey prop that is equal to the provided filterKey.  If filterKey
 * is null or undefined, the children array is returned as-is and the effective
 * key returned is null.
 *
 * If and only if filterKey and backupKey are provided (not null or undefined)
 * and the filtering process described above results in an empty array, then and
 * only then is the above process repeated except that the backupKey is used
 * instead.  In this case, the array result after the second filter attempt is
 * returned and backupKey is the effective key returned.  Otherwise, the result
 * array after the first filter attempt is returned and filterKey is the
 * effective key returned.  In either case, the returned array may be empty.
 *
 * arguments:
 *   - children: array of child components to filter
 *   - filterKey: key by which to filter children
 *   - backupKey: optional backup key by which to filter children
 *
 * returns:
 *   - the filtered array of child components or the children array as-is
 *   - the effective key by which the children have been filtered or null
 */
const filterChildren = (children, filterKey, backupKey) => {
  let { backupKey, filterKey } = options;
  let filteredChildren = children;
  let effectiveKey = null;

  if (!isUndefined(filterKey) && !isNull(filterKey)) {
    effectiveKey = filterKey
    filteredChildren = children.filter(
      (child) => child.props.groupKey === effectiveKey);

    if (
      filteredChildren.length == 0 &&
      !isUndefined(backupKey) &&
      !isNull(backupKey)
    ) {
      effectiveKey = backupKey
      filteredChildren = children.filter(
        (child) => child.props.groupKey === effectiveKey);
    }
  }

  return result;
};

class Group extends React.Component {
  render () {
    let {
      children,
      backupKey,
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

    if (onlyMatching) {
      [children, filterKey] = filterChildren(children, filterKey, backupKey);
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
      backupKey: React.PropTypes.string,
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
