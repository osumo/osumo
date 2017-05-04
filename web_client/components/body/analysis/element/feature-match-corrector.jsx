import { isNil } from 'lodash';
import React from 'react';
import { sortable } from 'react-sortable';

const createSortableListItem = (index) => {
  const borderRadius = 5;
  const defaultPadding = 2;
  const sidePadding = 6;
  const border = '1px solid black';

  const roundLeft = (index === 0 ? borderRadius : 0);
  const roundRight = (index === 0 ? 0 : borderRadius);
  const padLeft = (index === 0 ? sidePadding : defaultPadding);
  const padRight = (index === 0 ? defaultPadding : sidePadding);

  const BASE_STYLE = {
    borderTop: border,
    borderLeft: border,
    borderRight: (index === 0 ? null : border),
    borderBottom: null,
    borderTopLeftRadius: roundLeft,
    borderBottomLeftRadius: roundLeft,
    borderTopRightRadius: roundRight,
    borderBottomRightRadius: roundRight,
    padding: 2,
    paddingLeft: padLeft,
    paddingRight: padRight,
    margin: 0,
    width: 200,
    overflow: 'hidden'
  };

  class Result extends React.Component {
    static get displayName () {
      return `SortableListItem${index}`;
    }

    render () {
      let style = {};
      let { props } = this;

      /*
       * Our props are stashed away in the list of "children", since "children"
       * is the only prop that react-sortable lets through to these components.
       */
      let { children: [{ beingDragged, last }, children] } = props;

      if (beingDragged) {
        style.background = 'lavender';
      }

      if (last) {
        style.borderBottom = border;
      }

      return <div
        {...this.props}
        style={{ ...BASE_STYLE, ...style }}
        className='list-item'
      >
        {children}
      </div>;
    }
  }

  return sortable(Result);
};

const SortableListItemClasses = [
  createSortableListItem(0),
  createSortableListItem(1)
];

class FeatureMatchCorrector extends React.Component {
  render () {
    let {
      baseMatching,
      onStateChange,
      state: {
        value0 = null,
        value1 = null,
        draggingIndex0,
        draggingIndex1
      } = {}
    } = this.props;

    const numEntries = baseMatching.length;

    const range = (() => {
      let dummyArray = null;
      return () => {
        if (isNil(dummyArray)) {
          dummyArray = new Array(numEntries).fill(null);
        }

        return dummyArray.map((_, i) => i);
      };
    })();

    if (isNil(value0)) {
      value0 = range();
    }

    if (isNil(value1)) {
      value1 = range();
    }

    const wrapOnStateChange = (index) => (obj = {}) => {
      let draggingIndexKey = `draggingIndex${index}`;
      let valueKey = `value${index}`;

      let { items = null, draggingIndex } = obj;
      let update = { [draggingIndexKey]: draggingIndex };
      if (!isNil(items)) {
        update[valueKey] = items;
      }

      onStateChange(update);
    };

    const computeListItems = (index) => (
      index === 0 ? value0 : value1
    ).map((i, j) => {
      let { pair } = baseMatching[i];
      let item = pair[index];
      if (isNil(item)) {
        item = '[UNUSED]';
      } else {
        item = item.value;
      }

      let extraProps = {
        beingDragged: (index === 0 ? draggingIndex0 : draggingIndex1) === j,
        last: j === numEntries - 1
      };

      const Class = SortableListItemClasses[index];

      return <Class
        key={i}
        updateState={wrapOnStateChange(index)}
        items={index === 0 ? value0 : value1}
        draggingIndex={index === 0 ? draggingIndex0 : draggingIndex1}
        sortId={j}
        outline='list'
      >
        {[extraProps, item]}
      </Class>;
    });

    const divStyle = {
      display: 'inline-block',
      padding: 0
    };

    return <div
      style={{
        border: '1px solid lightgrey',
        maxHeight: 300,
        overflowY: 'auto',
        textAlign: 'center'
      }}
    >
      <div className='list' style={divStyle}>{computeListItems(0)}</div>
      <div className='list' style={divStyle}>{computeListItems(1)}</div>
    </div>;
  }
}

export default FeatureMatchCorrector;
