import React from 'react';
import Element from './element';

import './styles.styl';

class Page extends React.Component {
  render () {
    let {
      description,
      elements,
      id,
      main_action,
      name,
      notes
    } = this.props;

    let descriptionText = `(${ id }) ` + (
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
      <div className='.g-analysis-page'>
        <div className='.g-analysis-page-header'>
          { descriptionComponent }
          { notesComponent }
          <form className='function-control'
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(main_action);
                }}>
              {elements.map((element) => (
                <Element { ...element }
                         main_action={ main_action }
                         key={ element.id }/>
              ))}
          </form>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      description: React.PropTypes.string,
      elements: React.PropTypes.arrayOf(React.PropTypes.object),
      id: React.PropTypes.number,
      main_action: React.PropTypes.string,
      name: React.PropTypes.string,
      notes: React.PropTypes.string
    };
  }
}

export default Page;
