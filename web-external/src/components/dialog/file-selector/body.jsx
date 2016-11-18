import React from 'react';
import $ from 'jquery';

import { setFileNavigation } from '../../../actions';
import RootSelector from '../../common/root-selector';

/* hacked to remove the download and view links */
/* TODO(opadron): flags controlling these links should be upstreamed */
import customItemListTemplate from './item-list-template';
girder.templates.itemList = customItemListTemplate;

// const FileSelectorView = girder.View.extend({
console.log(girder.views.HierarchyWidget);

const FileSelectorView = girder.View.extend({
  initialize: function (settings) {
    this.hierarchyView = new girder.views.HierarchyWidget({
      parentView: this,
      parentModel: settings.folder,
      showActions: false,
      showItems: true,
      checkboxes: false,
      routing: false,
      onItemClick: function (item) {
        settings.itemSelected(item.attributes);
      }
    });

    return this;
  },

  render: function () {
    this.hierarchyView.setElement(this.el).render();
    return this;
  }
});

const DUMMY_MODAL = { off: () => null, render: () => null };

export default class Body extends React.Component {
  clearModal () {
    const $modalRoot = $( this.refs.modalRoot );

    this.modal.off();
    $modalRoot.empty();
  }

  setModal () {
    let { folder, onFileSelect, parentType } = this.props;

    this.modal = (
      folder ?
        new FileSelectorView({
          el: $( this.refs.modalRoot ),
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
        })

      :
        DUMMY_MODAL
    );
  }

  refreshModal () {
    this.clearModal();
    this.setModal();
  }

  componentDidMount () {
    this.setModal();
    this.modal.render();
  }

  componentDidUpdate () {
    this.refreshModal()
    this.modal.render();
  }

  componentWillUnmount () {
    this.clearModal();
  }

  render () {
    return (
      <div className='modal-body'>
        <div className='g-hierarchy-root-container'>
          <RootSelector onRootSelect={
            ({ id, type }) => setFileNavigation(type, id)
          }/>
          <div className='im-hierarchy-widget' ref='modalRoot'/>
        </div>
      </div>
    );
  }
}
