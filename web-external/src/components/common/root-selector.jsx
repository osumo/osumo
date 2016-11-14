import React from 'react';
import $ from 'jquery';

const RootSelectorView = girder.View.extend({
  initialize: function (settings) {
    this.rootSelectorView = new girder.views.RootSelectorWidget({
      ...settings,
      parentView: this
    });

    this.listenTo(
      this.rootSelectorView,
      'g:selected',
      ({ root: { attributes: { _modelType: type }, id } }) => (
        settings.onItemSelect({ id, type })
      )
    );
    return this;
  },

  render: function () {
    this.rootSelectorView.setElement(this.el).render();
    return this;
  }
});

export default class RootSelector extends React.Component {
  clearSelector () {
    const $root = $( this.refs.root );

    if (this.rootSelector) {
      this.rootSelector.stopListening(this.rootSelector.rootSelectorView);
      this.rootSelector.rootSelectorView.off();
      $root.empty();
    }
  }

  setSelector () {
    const { onRootSelect } = this.props;
    const $root = $( this.refs.root );

    this.rootSelector = new RootSelectorView({
      el: $root,
      parentView: null,
      onItemSelect: onRootSelect
    });
  }

  refreshSelector () {
    this.clearSelector();
    this.setSelector();
  }

  componentDidMount () {
    this.setSelector();
    this.rootSelector.render();
  }

  componentDidUpdate () {
    this.refreshSelector()
    this.rootSelector.render();
  }

  componentWillUnmount () {
    this.clearSelector();
  }

  render () {
    return (<div ref='root'/>);
  }
}
