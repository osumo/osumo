import React from 'react';
import { isUndefined } from 'lodash';

import Element from './element';

import './styles.styl';

class Page extends React.Component {
  render () {
    let {
      description,
      elements,
      form,
      id,
      mainAction,
      name,
      notes,
      onAction,
      onFileSelect,
      onStateChange
    } = this.props;

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
      <div className='.g-analysis-page'>
        <div className='.g-analysis-page-header'>
          { descriptionComponent }
          { notesComponent }
          <form className='function-control'
                onSubmit={(e) => {
                  e.preventDefault();
                  onAction(mainAction);
                }}>
              {
                elements
                  .filter((element) => element.type !== 'hidden')
                  .map((element) => {
                    let key = (
                      isUndefined(element.key) ? element.id : element.key);
                    return (
                      <Element { ...element }
                               mainAction={ mainAction }
                               onAction={ onAction }
                               onFileSelect={ () => onFileSelect(element) }
                               onStateChange={
                                 (state) => onStateChange(element, state)
                               }
                               state={ form[key] || {} }
                               key={ element.id }/>
                    );
                  })
              }
          </form>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      description: React.PropTypes.string,
      elements: React.PropTypes.arrayOf(React.PropTypes.object),
      form: React.PropTypes.object,
      id: React.PropTypes.number,
      mainAction: React.PropTypes.string,
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      onAction: React.PropTypes.func,
      onFileSelect: React.PropTypes.func,
      onStateChange: React.PropTypes.func
    };
  }
}

export default Page;
