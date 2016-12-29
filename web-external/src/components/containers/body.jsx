import React from 'react';
import { connect } from 'react-redux';
import Body from '../body';
import FrontPage from '../body/front-page';
import Analysis from './analysis';

const BodyContainer = connect(
  ({ globalNavTarget: filterKey }) => ({ backupKey: '', filterKey }),

  () => ({
    children: [
      <FrontPage groupKey='' key=''/>,
      <Analysis groupKey='testing' key='testing'/>
    ]
  })
)(Body);

export default BodyContainer;
