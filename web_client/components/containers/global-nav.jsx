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
        icon='icon-upload'
        name='Upload Data'
        groupKey='upload'
        key='upload'
      />,

      <GlobalNavEntry
        icon='icon-chart-bar'
        name='Analysis'
        groupKey='analysis'
        key='analysis'
      />,

      <GlobalNavEntry
        icon='icon-sliders'
        name='Miscellaneous'
        groupKey='misc'
        key='misc'
      />
    ]
  })
)(GlobalNav);

export default GlobalNavContainer;
