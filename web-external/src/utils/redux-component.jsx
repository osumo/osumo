import React from 'react';

const reduxComponent = (store, renderCallback, pTypes = {}) => {
  const dispatch = (...args) => store.dispatch(...args);

  return class ReduxComponent extends React.Component {
    componentDidMount () {
      this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount () {
      this.unsubscribe();
    }

    render () {
      return renderCallback(store.getState(), dispatch);
    }

    static get propTypes () {
      return pTypes;
    }
  };
};

export default reduxComponent;
