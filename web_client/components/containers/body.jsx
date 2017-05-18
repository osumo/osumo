import React from 'react';
import { connect } from 'react-redux';
import Body from '../body';
import FrontPage from '../body/front-page';
import Analysis from './analysis';
import Upload from './upload';
import Misc from './misc';

const BodyContainer = connect(
  ({ globalNavTarget: filterKey }) => ({ backupKey: '', filterKey }),

  () => ({
    children: [
      <FrontPage groupKey='' key='' />,
      <Upload groupKey='upload' key='upload' />,
      <Analysis groupKey='analysis' key='analysis' />,
      <Misc groupKey='misc' key='misc' />
    ]
  })
)(Body);

export default BodyContainer;
