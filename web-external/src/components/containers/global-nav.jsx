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
      <GlobalNavEntry icon='user'
                      name='Testing'
                      groupKey='testing'
                      key='testing'/>
    ]
  })
)(GlobalNav);

export default GlobalNavContainer;
