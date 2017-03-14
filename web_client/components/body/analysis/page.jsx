import React from 'react';
import { isNil, isUndefined } from 'lodash';

import Element from './element';

import './styles.styl';

class Page extends React.Component {
  render () {
    let {
      description,
      elements,
      mainAction,
      name,
      notes,
      objects,
      onAction,
      onFileSelect,
      onStateChange,
      states
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

    let onSubmit = (e) => { e.preventDefault(); };
    if (!isNil(mainAction)) {
      onSubmit = (e) => {
        e.preventDefault();
        onAction(mainAction);
      };
    }

    return (
      <div className='.g-analysis-page'>
        <div className='.g-analysis-page-header'>
          { descriptionComponent }
          { notesComponent }
          <form className='function-control' onSubmit={onSubmit}>
            {
              elements
                .map((id) => (objects[id] || {}))
                .filter(({ type }) => type !== 'hidden')
                .map((element) => (
                  <Element
                    {...element}
                    elementKey={element.key}
                    mainAction={mainAction}
                    objects={objects}
                    states={states}
                    onAction={onAction}
                    onFileSelect={() => onFileSelect(element)}
                    onStateChange={(state) => onStateChange(element, state)}
                    onChildFileSelect={onFileSelect}
                    onChildStateChange={onStateChange}
                    state={states[element.id] || {}}
                    key={element.id}
                  />
                ))
            }
          </form>
        </div>
      </div>
    );
  }
}

export default Page;
