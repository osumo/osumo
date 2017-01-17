import React from 'react';
import { isArray, isFunction, isNull, isUndefined } from 'lodash';

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
 * If onlyMatching is provided, and set to false, then the array is not actually
 * filtered, but instead always returned as-is.  This feature is so that instead
 * of entirely excluding components from the result array, child components can
 * instead modify themselves according to the effective filterKey (for example,
 * they can be hidden but still present in the DOM).  Even then, the effective
 * key is still computed and returned.
 *
 * arguments:
 *   - children: array of child components to filter
 *   - filterKey: key by which to filter children
 *   - options.backupKey: optional backup key by which to filter children
 *   - options.onlyMatching: whether to actually exclude filtered child
 *     components from the result array (default: true)
 *
 * returns:
 *   - the filtered array of child components or the children array as-is
 *   - the effective key by which the children have been filtered or null
 */
const filterChildren = (children, filterKey, options={}) => {
  let { backupKey, onlyMatching } = options;
  let filteredChildren = children;
  let effectiveKey = (
    (
      isUndefined(filterKey) ||
      isNull(filterKey) ||
      isUndefined(backupKey) ||
      isNull(backupKey)
    )
      ? filterKey
      : children.some((child) => child.props.groupKey === filterKey)
        ? filterKey
        : backupKey
  );

  onlyMatching = (isUndefined(onlyMatching) || onlyMatching);

  if (onlyMatching && !isUndefined(effectiveKey) && !isNull(effectiveKey)) {
    filteredChildren = children.filter(
      (child) => child.props.groupKey === effectiveKey);
  }

  return [filteredChildren, effectiveKey];
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

    [children, filterKey] = filterChildren(
      children,
      filterKey,
      { backupKey, onlyMatching }
    );

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
