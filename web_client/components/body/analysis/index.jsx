import React from 'react';

import AnalysisPage from './page';
import objectReduce from '../../../utils/object-reduce';
import { NBSP } from '../../../constants';

class Analysis extends React.Component {
  render () {
    let {
      baseAnalysisModules,
      forms,
      onBaseAnalysis,
      onAction,
      onFileSelect,
      onStateChange,
      pages
    } = this.props;

    pages = (pages || []);
    forms = (forms || {});

    let analysisPageContents = (
      <h3 style={{
        textAlign: 'center',
        position: 'relative',
          top: 50
      }}>Use the dropdown menu above to select an analysis.</h3>
    );

    if (pages.length > 0) {
      analysisPageContents = pages.map((page) => (
        <AnalysisPage { ...page }
                      form={ forms[page.key] || {} }
                      onAction={
                        (action) => onAction(forms, page, action)
                      }
                      onFileSelect={ onFileSelect }
                      onStateChange={ onStateChange }
                      key={ page.id }/>
      ));
    }

    return (
      <div className='analysis'>
        <div className='analysis-selector'>
          <h4>Select analysis</h4>
          { NBSP }
          <select onChange={ ({ target: { value } }) => onBaseAnalysis(value) }>
            <option key={ null } value={ "" }>- none -</option>
            {baseAnalysisModules.map(({ name, key, module }) => (
              <option key={ key } value={ key }>{ name }</option>
            ))}
          </select>
        </div>
        <div className='analysis-pages'>
          { analysisPageContents }
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      baseAnalysisModules: React.PropTypes.arrayOf(React.PropTypes.object),
      forms: React.PropTypes.object,
      onAction: React.PropTypes.func,
      onFileSelect: React.PropTypes.func,
      onStateChange: React.PropTypes.func,
      pages: React.PropTypes.arrayOf(React.PropTypes.object)
    };
  }
}

export default Analysis;
