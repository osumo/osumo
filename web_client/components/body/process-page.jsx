import React from 'react';

import './process-page.styl';

class ProcessPage extends React.Component {
  render () {
    let { description, name, notes, ui } = this.props;

    let descriptionText = (
      [name, description]
        .map((text) => text || '')
        .filter((text) => text !== '')
        .join(': ')
    );

    let notesText = notes || '';

    let descriptionComponent = (
      descriptionText === ''
        ? descriptionText
        : (
          <div className='task-desc g-item-info-header'>
            { descriptionText }
          </div>
        )
    );

    let notesComponent = (
      notesText === ''
        ? notesText
        : (<div className='task-notes'>{ notesText }</div>)
    );

    return (
      <div className='process-page'>
        { descriptionComponent }
        { notesComponent }
        {
          ui.map(({ key }) => (<div key={key}>{key}</div>))
        }
      </div>
    );
  }

  static get propTypes () {
    return {
      description: React.PropTypes.string,
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      ui: React.PropTypes.arrayOf(React.PropTypes.object)
    };
  }
}

export default ProcessPage;
