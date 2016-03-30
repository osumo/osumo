import React from 'react';

import parallelSets from '../lib/parallelSets';

export default class ParallelSetsComponent extends React.Component {
  componentDidMount () {
    this.groups = {
      group_f: 0,
      GROUP: {group1: [1, 2], group2: [3, 4]},
      GROUP1: {node: [], link: []},
      GROUP2: {node: [], link: []}
    };
    parallelSets.init(this.props.data, this.groups);
  }

  render () {
    let {
      onProcess
    } = this.props;

    let result = <div className='parallelsets'>
      <div className='controls'>
        <div className='btn-group alignment' data-toggle='buttons-radio'>
          <button type='button' className='btn' onClick={onProcess} id='subgroup1'>Subgroup 1</button>
          <button type='button' className='btn' onClick={onProcess} id='subgroup2'>Subgroup 2</button>
        </div>
        <input type='button' onClick={onProcess} className='btn btn-primary' value='Reset'/>
        <input type='button' onClick={onProcess} className='btn btn-primary' value='PLOT'/>
      </div>
      <div id='brick'/>
    </div>;
    return result;
  }

  static get defaultProps () {
    return {
      data: null,
      task: null,
      job: null,

      onProcess () { console.log('process', this); }  // DWM::
    };
  }

  static get propTypes () {
    return {
      data: React.PropTypes.any,
      task: React.PropTypes.object,
      job: React.PropTypes.object
    };
  }
}
