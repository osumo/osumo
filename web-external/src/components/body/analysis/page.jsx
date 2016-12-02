import React from 'react';
import Element from './element';

class Page extends React.Component {
  render () {
    let { id, form, elements, action } = this.props;

    /* TODO(opadron): move action to be an prop of Page */
    action = (action || 'dummy action');

    return (
      <div className='.g-analysis-page'>
        <div className='.g-analysis-page-header'>
          <h4>{ id }</h4>
          <h4>{ form }</h4>
          <form className='function-control'
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(action);
                }}>
              {elements.map((element) => (
                <Element key={ element.id } { ...({ ...element, action }) }/>
              ))}
          </form>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      id: React.PropTypes.number,
      form: React.PropTypes.string,
      elements: React.PropTypes.arrayOf(React.PropTypes.object)
    };
  }
}

export default Page;
