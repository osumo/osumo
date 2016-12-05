import React from 'react';

import AnalysisPage from './page';

class Analysis extends React.Component {
  render () {
    let { pages } = this.props;
    pages = (pages || []);

    return (
      <div className='analysis'>
        { pages.map((page) => (<AnalysisPage { ...page } key={ page.id }/>)) }
      </div>
    );
  }

  static get propTypes () {
    return {
      pages: React.PropTypes.arrayOf(React.PropTypes.object)
    };
  }
}

export default Analysis;
