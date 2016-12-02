import React from 'react';
import ButtonElement from './button';
import FieldElement from './field';

class Element extends React.Component {
  render () {
    let { id, type, ...props } = this.props;
    let result;

    switch (type) {
      case 'button':
        result = (<ButtonElement { ...props }/>);
        break;

      case 'field':
        result = (<FieldElement { ...props }/>);
        break;

      default:
        result = (
          <div className='.g-analysis-element'>
            { id }
            { JSON.stringify(this.props) }
          </div>
        );
    }

    return result;
  }

  static get propTypes () {
    return { id: React.PropTypes.number };
  }
}

export default Element;
