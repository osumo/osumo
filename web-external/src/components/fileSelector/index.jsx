import React from 'react';

import content from './content.jade';

const FileSelectorWidget = girder.View.extend({
  initialize: function (settings) {
    this.hierarchyView = new girder.views.HierarchyWidget({
      parentView: this,
      parentModel: settings.folder,
      showActions: true,
      checkboxes: true,
      onItemClick: function (item) {
        settings.itemSelected(item);
        $('.modal-header button[data-dismiss="modal"]').click();
      }
    });
    return this;
  },

  render: function () {
    this.$el.html(content({})).girderModal(this);
    this.hierarchyView.setElement(this.$('.im-hierarchy-widget')).render();
    return this;
  }
});

export default class FileSelector extends React.Component {
  componentWillMount () {
    this.modal = new FileSelectorWidget({
      el: $('#g-dialog-container'),
      parentView: null,
      itemSelected: this.props.itemSelected,
      folder: new girder.models.FolderModel(this.props.folder)
    });
  }

  render () {
    return <div className='fileselector'>
      <input type='button' onClick={() => this.modal.render()} className='btn btn-primary' value='Select an item' />
    </div>;
  }
}
