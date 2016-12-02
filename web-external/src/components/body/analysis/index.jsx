import React from 'react';

import AnalysisPage from './page';

class Analysis extends React.Component {
  render () {
    let { pages } = this.props;
    pages = (pages || []);

    return (
      <div className='analysis'>
        { pages.map(({ id, form, elements }) => (
          <AnalysisPage elements={ elements }
                        form={ form }
                        id={ id }
                        key={ id }/>
        )) }
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
