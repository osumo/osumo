import React from 'react';

import AnalysisPage from './page';
import AnalysisTabBar from './tab-bar';
import { NBSP } from '../../../constants';

class Analysis extends React.Component {
  render () {
    let {
      baseAnalysisModules,
      busy,
      currentPage,
      onBaseAnalysis,
      onAction,
      onFileSelect,
      onItemSave,
      onPageClick,
      onStateChange,
      objects,
      pages,
      states
    } = this.props;

    objects = (objects || []);
    pages = (pages || []);
    states = (states || {});

    const emptyAnalysisPageStyle = {
      textAlign: 'center',
      position: 'relative',
      top: 50,
      color: '#505050'
    };

    let analysisPageContents = (
      <h3 style={emptyAnalysisPageStyle}>
        Use the dropdown menu above to select an analysis.
      </h3>
    );

    if (pages.length > 0) {
      analysisPageContents = (
        pages
          .filter((id) => (id.toString() === currentPage.toString()))
          .map((id) => ({ ...(objects[id] || {}) }))
          .map((page) => (
            <AnalysisPage
              {...page}
              busy={busy}
              states={states}
              objects={objects}
              onAction={
                (action, ...extraArgs) => (
                  onAction(objects, states, page, action, ...extraArgs)
                )
              }
              onFileSelect={onFileSelect}
              onItemSave={onItemSave}
              onStateChange={onStateChange}
              key={page.id}
            />
          ))
      );
    }

    return (
      <div className='analysis'>
        <div className='analysis-selector'>
          <h4>{busy ? 'Running...' : 'Select analysis'}</h4>
          {NBSP}
          <select
            style={{ visibility: busy ? 'hidden' : 'visible' }}
            onChange={
              busy ? null : ({ target: { value } }) => onBaseAnalysis(value)
            }
          >
            <option key={null} value={''}>- none -</option>,
            {
              baseAnalysisModules.map(({ name, key, module }) => (
                <option key={key} value={key}>{name}</option>
              ))
            }
          </select>
        </div>
        <AnalysisTabBar
          currentPage={currentPage}
          objects={objects}
          onPageClick={onPageClick}
          pages={pages}
        />
        <div className='analysis-pages'>
          {analysisPageContents}
        </div>
      </div>
    );
  }
}

export default Analysis;
