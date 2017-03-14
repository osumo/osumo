import React from 'react';
import { isUndefined } from 'lodash';

import ButtonElement from './button';
import TabGroup from './tab-group'
import FieldElement from './field';
import FileSelectionElement from './file-selection';
import ImageElement from './image';
import ParallelSetsElement from './parallel-sets';

class Element extends React.Component {
  render () {
    let {
      elements,
      id,
      type,
      state,
      objects,
      states,
      onAction,
      onChildFileSelect,
      onChildStateChange,
      onFileSelect,
      onStateChange,
      ...props
    } = this.props;

    let result;
    let wrapResult = true;

    elements = elements || [];
    let children = (
      elements.length > 0
        ? (
          elements
            .map((id) => (objects[id] || {}))
            .map((element) => (
              <Element
                {...element}
                elementKey={element.key}
                mainAction={props.mainAction}
                objects={objects}
                states={states}
                onAction={onAction}
                onFileSelect={() => onChildFileSelect(element)}
                onStateChange={(state) => onChildStateChange(element, state)}
                onChildFileSelect={onChildFileSelect}
                onChildStateChange={onChildStateChange}
                state={states[element.id] || {}}
                key={element.id}
              />
            ))
        )
        : null
    );

    switch (type) {
      case 'button':
        result = (
          <ButtonElement
            key='result'
            onAction={onAction}
            children={children}
            {...props}
          />
        );
        wrapResult = false;
        break;

      case 'tabGroup':
        result = (
          <TabGroup
            key='result'
            onStateChange={onStateChange}
            state={state}
            children={children}
            {...props}
          />
        );
        break;

      case 'field':
        result = (
          <FieldElement
            key='result'
            onStateChange={onStateChange}
            state={state}
            children={children}
            {...props}
          />
        );
        break;

      case 'fileSelection':
      case 'file_selection':
      case 'file-selection':
        result = (
          <FileSelectionElement
            key='result'
            onStateChange={onStateChange}
            onFileSelect={onFileSelect}
            state={state}
            children={children}
            {...props}
          />
        );
        break;

      case 'folderSelection':
      case 'folder_selection':
      case 'folder-selection':
        result = (
          <FileSelectionElement
            key='result'
            onStateChange={onStateChange}
            onFileSelect={onFileSelect}
            state={state}
            children={children}
            {...props}
          />
        );
        break;

      case 'image':
        result = (<ImageElement key='result' {...props} />);
        break;

      case 'parallelSets':
      case 'parallel_sets':
      case 'parallel-sets':
        result = (
          <ParallelSetsElement
            key='result'
            onStateChange={onStateChange}
            state={state}
            children={children}
            {...props}
          />
        );
        break;

      default:
        result = (
          <div key='result' className='.g-analysis-element'>
            { id }
            { JSON.stringify(this.props) }
            { children }
          </div>
        );
        wrapResult = false;
    }

    if (wrapResult) {
      let elements = [];
      let { description, name, notes } = this.props;
      let extraProps = {};

      if (!isUndefined(name)) {
        elements.push(
          <label className='control-label' key='control-label'>{ name }</label>
        );
      }

      if (!isUndefined(notes)) {
        elements.push(
          <div className='control-notes' key='control-notes'>{ notes }</div>
        );
      }

      if (!isUndefined(description)) {
        extraProps.title = description;
      }

      elements.push(result);

      result = (
        <div className='function-control' {...extraProps}>{elements}</div>
      );
    }

    return result;
  }
}

export default Element;
