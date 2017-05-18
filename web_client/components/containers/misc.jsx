import { connect } from 'react-redux';

import Misc from '../body/misc';
import actions from '../../actions';
import { Promise, SCHEDULES, map as promiseMap } from '../../utils/promise';

const MiscContainer = connect(
  ({
    misc: { tabKey = 'log' } = {}
  }) => ({
    tabKey
  }),

  (dispatch) => ({
    onTabClick: (key) => dispatch(actions.setMiscTabKey(key))
  })
)(Misc);

export default MiscContainer;
