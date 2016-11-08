import React from 'react';
import jQuery from 'jquery';

const FileSelectorView = girder.View.extend({
  initialize: function (settings) {
    this.hierarchyView = new girder.views.HierarchyWidget({
      parentView: this,
      parentModel: settings.folder,
      showActions: true,
      checkboxes: true,
      onItemClick: function (item) {
        settings.itemSelected(item.attributes);
      }
    });
    return this;
  },

  render: function () {
    this.hierarchyView.setElement(this.$('.im-hierarchy-widget')).render();
    return this;
  }
});

export default class Body extends React.Component {
  refreshModal () {
    this.modal = new FileSelectorView({
      el: $(this.refs.root),
      parentView: null,
      itemSelected: this.props.onFileSelect,
      folder: new (
        this.props.parentType === 'collection' ?
          girder.models.CollectionModel

        : this.props.parentType === 'user' ?
          girder.models.UserModel

        :
          girder.models.FolderModel
      )(this.props.folder)
    });
  }

  componentDidMount () {
    this.refreshModal();
    this.modal.render();
  }

  componentDidUpdate () {
    this.refreshModal()
    this.modal.render();
  }

  render () {
    return (
      <div className='modal-body' ref='root'>
        <div className='im-hierarchy-widget'/>
      </div>
    );
  }
}
