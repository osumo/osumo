import { connect } from 'react-redux';
import Analysis from '../body/analysis';
import { apiRoot } from '../../globals';

const AnalysisContainer = connect(
  ({ analysis: { pages } }) => ({ pages }),

  () => ({})
)(Analysis);

export default AnalysisContainer;
