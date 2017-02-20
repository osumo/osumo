import { connect } from 'react-redux';
import Footer from '../footer';
import { apiRoot } from '../../globals';

const FooterContainer = connect(null, () => ({ apiRoot }))(Footer);

export default FooterContainer;
