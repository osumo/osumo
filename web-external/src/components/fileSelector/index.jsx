import React from 'react';

import content from './content.jade';

const FileSelectorWidget = girder.View.extend({
  initialize: function (settings) {
    this.folder = settings.folder;
    this.hierarchyView = new girder.views.HierarchyWidget({
      parentView: this,
      parentModel: this.folder,
      showActions: true,
      checkboxes: true,
      onItemClick: function (item) {
        console.log(item);
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
      folder: new girder.models.FolderModel(this.props.folder)
    });
  }

  render () {
    let {
      folder
    } = this.props;

    return <div className='fileselector'>
      <input type='button' onClick={() => this.modal.render()} className='btn btn-primary' value='Select an item' />
    </div>;
  }
}
