import React from 'react';

import AnalysisPage from './page';

class Analysis extends React.Component {
  render () {
    let {
      forms,
      onAction,
      onFileSelect,
      onStateChange,
      pages
    } = this.props;

    pages = (pages || []);
    forms = (forms || {});

    return (
      <div className='analysis'>
        {pages.map((page) => (
          <AnalysisPage { ...page }
                        form={ forms[page.name] || {} }
                        onAction={
                          (action) => onAction(forms, page, action)
                        }
                        onFileSelect={
                          (key) => onFileSelect(page, key)
                        }
                        onStateChange={
                          (key, state) => onStateChange(page, key, state)
                        }
                        key={ page.id }/>
        ))}
      </div>
    );
  }

  static get propTypes () {
    return {
      forms: React.PropTypes.object,
      onAction: React.PropTypes.func,
      onFileSelect: React.PropTypes.func,
      onStateChange: React.PropTypes.func,
      pages: React.PropTypes.arrayOf(React.PropTypes.object)
    };
  }
}

export default Analysis;
