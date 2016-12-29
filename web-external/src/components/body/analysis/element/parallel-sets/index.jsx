import React from 'react';
import { isArray, isUndefined } from 'lodash';
import d3Array from 'd3-array';
import d3Scale from 'd3-scale';
import d3Shape from 'd3-shape';

import LinkGroup from './link-group';
import NodeGroup from './node-group';
import './style';

class ParallelSets extends React.Component {
  render () {
    let {
      gapRatio,
      height,
      inputData,
      onStateChange,
      padding,
      state,
      width
    } = this.props;

    let {
      currentGroupSelection,
      value: groupSelections
    } = state;

    gapRatio  = gapRatio  ||  0.8;
    height    = height    ||  450;
    inputData = inputData ||   [];
    padding   = padding   ||    5;
    width     = width     ||  800;

    groupSelections = groupSelections || [];
    for (let i=0; i<2; ++i) {
      groupSelections[i] = groupSelections[i] || {};
      groupSelections[i].node = groupSelections[i].node || [];
      groupSelections[i].link = groupSelections[i].link || [];
    }

    const N = inputData.length;
    const maxN = d3Array.max(inputData, (x) => x.length);
    const maxV = d3Array.max(inputData, (x) => d3Array.sum(x, (y) => y.height));

    const x = (
      d3Scale
        .scaleBand()
        .domain(d3Array.range(N))
        .range([0, width + width/(N - 1)])
        .padding(gapRatio)
    );

    const y = (
      d3Scale
        .scaleLinear()
        .domain([0, maxV])
        .range([0, height - padding * maxN])
    );

    const line = (
      d3Shape
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3Shape.curveBasis)
    );

    const colors = [
      [
        '#659CEF',
        '#cd5555',
        '#FEE093',
        '#9f79ee',
        '#ee9572',
        '#008b00',
        '#b4cdcd',
        '#3d3d3d'
      ],
      [
        '#3d3d3d',
        '#b4cdcd',
        '#008b00',
        '#ee9572',
        '#9f79ee',
        '#FEE093',
        '#cd5555',
        '#659CEF'
      ]
    ];

    const returnObject = (i, flag) => {
      let m;
      for (m=0; m<inputData[flag].length; m++) {
        if (parseInt(inputData[flag][m].key, 10) === i) {
          return inputData[flag][m];
        }
      }
    };

    const linkLine = (start) => (l) => {
      let source = returnObject(l.source, 0);
      let target = returnObject(l.target, 1);
      let gapWidth = x(0) - 3;
      let bandWidth = x.bandwidth() + gapWidth;
      let startx = x.bandwidth() - bandWidth;
      if (!source) {
        0;
      }
      let sourcey = (
        y(source.offsetValue) +
        source.order*padding +
        y(l.outOffset) +
        0.5*y(l.count)
      );

      let targety = (
        y(target.offsetValue) +
        target.order*padding +
        y(l.inOffset) +
        0.5*y(l.count)
      );

      var points = (
        start
          ? [
            { x: startx, y: sourcey },
            { x: startx, y: sourcey },
            { x: startx, y: sourcey },
            { x: startx, y: sourcey }
          ]

          : [
            { x: startx               , y: sourcey },
            { x: startx + 0.5*gapWidth, y: sourcey },
            { x: startx + 0.5*gapWidth, y: targety },
            { x:                    -3, y: targety }
          ]
      );

      return line(points);
    };

    const onGroupClick = (index) => (e) => {
      e.preventDefault();
      return onStateChange({ currentGroupSelection: index });
    };

    const onReset = (e) => {
      e.preventDefault();
      return onStateChange({ value: [] });
    };

    const fill = (i) => (node) => colors[i][node.key - 1];

    const nodeGroupMembership = (i) => (node) => (
      groupSelections.map(({ node: nodes }) => (
        nodes.some(({ label, key }) => (
          label === node.label && key === node.key
        ))
      ))
    );

    const linkGroupMembership = (i) => (link) => (
      groupSelections.map(({ link: links }) => (
        links.some(({ source, target }) => (
          source === link.source &&
            target === link.target
        ))
      ))
    );

    const _height = (node) => y(node.height);

    const horizontalOffset = [0, x(1) - x(0)];

    const verticalOffset = (node, index) => (
      y(node.offsetValue) + index*padding
    );

    const _width = ((w) => () => w)(x.bandwidth());

    const onNodeClick = (node, e) => {
      e.preventDefault();

      let entryList = (
        currentGroupSelection === 1
          ? groupSelections[0].node
        : currentGroupSelection === 2
          ? groupSelections[1].node
        :
          null
      );

      if (!entryList) { return; }

      let add = true;
      let index = -1;
      entryList.every((entry, _i) => {
        add = !(
          entry.label === node.label &&
          entry.key === node.key
        );

        if (!add) { index = _i; }
        return add;
      });

      if (add) {
        entryList.push({
          key: node.key,
          label: node.label
        });
      } else {
        entryList.splice(index, 1);
      }

      return onStateChange({ value: groupSelections });
    };

    const onLinkClick = (link, e) => {
      e.preventDefault();

      let entryList = (
        currentGroupSelection === 1
          ? groupSelections[0].link
        : currentGroupSelection === 2
          ? groupSelections[1].link
        :
          null
      );

      if (!entryList) { return; }

      let add = true;
      let index = -1;
      entryList.every((entry, _i) => {
        add = !(
          entry.source === link.source &&
          entry.target === link.target
        );

        if (!add) { index = _i; }
        return add;
      });

      if (add) {
        entryList.push({
          source: link.source,
          target: link.target
        });
      } else {
        entryList.splice(index, 1);
      }

      return onStateChange({ value: groupSelections });
    };

    const pathString = linkLine(false);

    const strokeWidth = (link) => y(link.count);

    const nonEmpty = (array) => (isArray(array) && array.length > 0);

    const children = (
      inputData.map((nodes, i) => [nodes, i])
        /* create an entry for each node list as well as one for their links */
        .map(([nodes, i]) => {
          const links = (
            nodes.map(({ incoming }) => incoming || [])
              .filter(isArray)
              .reduce((a, b) => a.concat(b), [])
          );

          return [
            [0, nodes, i],
            [1, links, i]
          ];
        })

        /* flatten the above to a single list */
        .reduce((a, b) => a.concat(b), [])

        /* discard any entries with no nodes or no links */
        .filter(([, data]) => nonEmpty(data))

        /* place all node entries before link entries */
        .sort(([typeA, , iA], [typeB, , iB]) => (
          typeA > typeB ?  1 :
          typeA < typeB ? -1 :
          iA    >    iB ?  1 :
          iA    <    iB ? -1 : 0
        ))

        /* render */
        .map(([type, data, i]) => (
          type === 0 ? (
            <NodeGroup  fill={ fill(i) }
                        groupMembership={ nodeGroupMembership(i) }
                        height={ _height }
                        horizontalOffset={ horizontalOffset[i] }
                        key={ i }
                        onClick={ onNodeClick }
                        nodes={ data }
                        verticalOffset={ verticalOffset }
                        width={ _width }/>
          ) : (
            <LinkGroup groupMembership={ linkGroupMembership(i) }
                        horizontalOffset={ horizontalOffset[i] }
                        key={ `path-${ i }` }
                        links={ data }
                        onClick={ onLinkClick }
                        pathString={ pathString }
                        strokeWidth={ strokeWidth }/>
          )
        ))
    );

    return (
      <div className='parallelsets'>
        <div className='controls'>
          <div className='btn-group alignment' data-toggle='buttons-radio'>
            <input type='button'
                    className='btn'
                    onClick={ onGroupClick(1) }
                    value='Group 1'/>
            <input type='button'
                    className='btn'
                    onClick={ onGroupClick(2) }
                    value='Group 2'/>
          </div>
          <input type='button'
                  className='btn btn-primary'
                  onClick={ onReset }
                  value='Reset'/>
        </div>
        <div id='brick'>
          <svg width={ width } height={ height }>
          { children }
          </svg>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      gapRatio: React.PropTypes.number,
      height: React.PropTypes.number,
      inputData: React.PropTypes.array,
      onStateChange: React.PropTypes.func,
      padding: React.PropTypes.number,
      state: React.PropTypes.object,
      width: React.PropTypes.number
    };
  }
}

export default ParallelSets;
