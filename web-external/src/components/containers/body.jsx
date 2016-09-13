import React from 'react';
import { connect } from 'react-redux';
import Body from '../body';
import FrontPage from '../body/front-page';
import ProcessData from '../body/process-data';

const BodyContainer = connect(
  ({ globalNavTarget: filterKey }) => ({ filterKey }),

  () => ({
    children: [
      <FrontPage groupKey='' key=''/>,
      <ProcessData groupKey='process' key='process'/>
    ]
  })
)(Body);

export default BodyContainer;
