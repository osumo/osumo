import React from 'react';
import d3 from 'd3';
import $ from 'jquery';

import parallelSets from '../lib/parallelSets';
import '../style/parallelSets';

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
      onGroup1,
      onGroup2,
      onProcess,
      onReset
    } = this.props;

    let result = <div className='parallelsets'>
      <div className='controls'>
        <div className='btn-group alignment' data-toggle='buttons-radio'>
          <button type='button' className='btn' onClick={onGroup1.bind(this)} id='subgroup1'>Subgroup 1</button>
          <button type='button' className='btn' onClick={onGroup2.bind(this)} id='subgroup2'>Subgroup 2</button>
        </div>
        <input type='button' onClick={onReset.bind(this)} className='btn btn-primary' value='Reset'/>
        <input type='button' onClick={onProcess.bind(this)} className='btn btn-primary' value='PLOT'/>
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

      onGroup1 () {
        this.groups.group_f = 1;
        $('#subgroup2').removeClass('active');
        $('#subgroup1').addClass('active');
      },
      onGroup2 () {
        this.groups.group_f = 2;
        $('#subgroup1').removeClass('active');
        $('#subgroup2').addClass('active');
      },
      onProcess () {
        console.log(JSON.stringify(this.groups));  // DWM::
      },
      onReset () {
        this.groups.group_f = 0;
        this.groups.GROUP1 = {node: [], link: []};
        this.groups.GROUP2 = {node: [], link: []};
        $('#subgroup1,#subgroup2').removeClass('active');
        d3.selectAll('rect').attr('class', 'box');
        d3.selectAll('path.link').attr('class', 'link');
      }
    };
  }

  static get propTypes () {
    return {
      data: React.PropTypes.any,
      task: React.PropTypes.object,
      job: React.PropTypes.object,
      onGroup1: React.PropTypes.func,
      onGroup2: React.PropTypes.func,
      onProcess: React.PropTypes.func,
      onReset: React.PropTypes.func
    };
  }
}
