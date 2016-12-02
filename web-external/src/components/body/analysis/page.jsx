import React from 'react';

class Page extends React.Component {
  render () {
    let { id, form, elements } = this.props;

    return (
      <div>
        { `ID: ${ id }, formName: ${ form }` }
      </div>
    );
  }

  static get propTypes () {
    return {
      id: React.PropTypes.number,
      form: React.PropTypes.string,
      elements: React.PropTypes.arrayOf(React.PropTypes.string)
    };
  }
}

export default Page;
