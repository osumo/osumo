import React from 'react';
import { connect } from 'react-redux';
import { router } from '../../globals';
import GlobalNav from '../global-nav';
import GlobalNavEntry from '../global-nav/entry';

const GlobalNavContainer = connect(
  ({ globalNavTarget: filterKey }) => ({ filterKey }),

  () => ({
    onChildClick: (groupKey) => router(groupKey),
    children: [
      <GlobalNavEntry
        icon='user'
        name='Upload Data'
        groupKey='upload'
        key='upload'
      />,

      <GlobalNavEntry
        icon='user'
        name='Analysis'
        groupKey='analysis'
        key='analysis'
      />
    ]
  })
)(GlobalNav);

export default GlobalNavContainer;
