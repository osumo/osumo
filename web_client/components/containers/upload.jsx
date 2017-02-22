
import { connect } from 'react-redux';

import Upload from '../body/upload';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';

const UploadContainer = connect(
  (state) => ({
    browseText: 'Click or Drop Here',
    statusText: '[CURRENT STATUS]',
    subtitle: 'Upload local data to SUMO',
    title: 'Upload Data',
    validationFailedMessage: ''
  }),

  (dispatch) => ({
    x: 3
  })
)(Upload);

export default UploadContainer;
