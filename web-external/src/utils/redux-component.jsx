import React from 'react';

const reduxComponent = (store, renderCallback) => {
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
  };
};

export default reduxComponent;
