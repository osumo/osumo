
import { connect } from 'react-redux';

import Upload from '../body/upload';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';

const UploadContainer = connect(
  (state) => ({
    browseText: '[BROWSE TEXT]',
    noneSelectedText: '[NONE SELECTED TEXT]',
    subtitle: '[SUBTITLE]',
    title: '[TITLE]',
    validationFailedMessage: '[VALIDATION FAILED MESSAGE]'
  }),

  (dispatch) => ({
    x: 3
  })
)(Upload);

export default UploadContainer;
