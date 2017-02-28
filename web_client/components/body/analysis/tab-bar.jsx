import React from 'react';
import './tab-bar-style.styl';

class AnalysisTabBar extends React.Component {
  render () {
    let {
      currentPage,
      onPageClick,
      pages
    } = this.props;

    let tabElements = pages.map((page) => (
      <div
        className={
          'analysis-tab' + (
            page.id === currentPage
              ? ' active'
              : !page.enabled
                ? ' disabled'
                : ''
          )
        }
        onClick={
          (page.id !== currentPage && page.enabled)
            ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onPageClick(page);
            }
            : null
        }
        key={page.key}
      >
        {page.name || page.key}
      </div>
    ));

    if (tabElements.length > 1) {
      tabElements = [
        tabElements[0],
        ...(
          tabElements
            .slice(1)
            .map((e, i) => {
              let divider = (
                <div className='analysis-tab-divider' key={`divider-${i}`} />
              );

              return [divider, e];
            })
            .reduce((a, b) => a.concat(b), [])
        )
      ];
    }

    return (
      <div className='analysis-tab-bar'>
        { tabElements }
      </div>
    );
  }
}

export default AnalysisTabBar;

