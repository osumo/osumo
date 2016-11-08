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
    let { folder, onFileSelect, parentType } = this.props;

    if (!folder) {
      this.modal = null;
    } else {
      this.modal = new FileSelectorView({
        el: $(this.refs.root),
        parentView: null,
        itemSelected: onFileSelect,
        folder: new (
          parentType === 'collection' ?
            girder.models.CollectionModel

          : parentType === 'user' ?
            girder.models.UserModel

          :
            girder.models.FolderModel
        )(folder)
      });
    }
  }

  componentDidMount () {
    this.refreshModal();
    if (this.modal) {
      this.modal.render();
    }
  }

  componentDidUpdate () {
    this.refreshModal()
    if (this.modal) {
      this.modal.render();
    }
  }

  render () {
    return (
      <div className='modal-body' ref='root'>
        <div className='im-hierarchy-widget'/>
      </div>
    );
  }
}
