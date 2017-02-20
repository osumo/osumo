import React from 'react';
import { isUndefined } from 'lodash';
import MenuElement from './menu';
import ButtonElement from './button';
import FieldElement from './field';
import FileSelectionElement from './file-selection';
import ImageElement from './image';
import ParallelSetsElement from './parallel-sets';

class Element extends React.Component {
  render () {
    let {
      id,
      type,
      state,
      onAction,
      onFileSelect,
      onStateChange,
      ...props
    } = this.props;

    let result;
    let wrapResult = true;

    switch (type) {
      case 'button':
        result = (
          <ButtonElement
            key='result'
            onAction={onAction}
            {...props}
          />
        );
        wrapResult = false;
        break;

      case 'menu':
        result = (
          <MenuElement
            key='result'
            onStateChange={onStateChange}
            state={state}
            onAction={onAction}
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
            {...props}
          />
        );
        break;

      default:
        result = (
          <div key='result' className='.g-analysis-element'>
            { id }
            { JSON.stringify(this.props) }
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

  static get propTypes () {
    return {
      description: React.PropTypes.string,
      id: React.PropTypes.number,
      name: React.PropTypes.string,
      notes: React.PropTypes.string,
      onAction: React.PropTypes.func,
      onFileSelect: React.PropTypes.func,
      onStateChange: React.PropTypes.func,
      state: React.PropTypes.object,
      type: React.PropTypes.string
    };
  }
}

export default Element;
