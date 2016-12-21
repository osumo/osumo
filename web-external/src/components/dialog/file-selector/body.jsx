import React from 'react';
import $ from 'jquery';

import RootSelector from '../../common/root-selector';

/* hacked to remove the download and view links */
/* TODO(opadron): replace this with flags from girder/girder#1688 once we
 * migrate to Girder 2.0 */
import customItemListTemplate from './item-list-template.jade';
girder.templates.itemList = customItemListTemplate;

/* hacked to remove the metadata section */
/* TODO(opadron): replace this with flags from girder/girder#1688 once we
 * migrate to Girder 2.0 */
import customHierarchyTemplate from './hierarchy-template.jade';
girder.templates.hierarchyWidget = customHierarchyTemplate;

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
    let { folder, onRootSelect, parentType } = this.props;
    let manageLink = [];
    if (folder) {
      const manageHref = `girder#${ parentType }/${ folder._id }`;
      const manageText = (
        `Manage this ${ parentType }${ '\'' }s data (opens a new window)`);

      manageLink.push(
        <a href={ manageHref } key='manage' target='_blank'>{ manageText }</a>);
    }

    return (
      <div className='modal-body'>
        { manageLink }
        <div className='g-hierarchy-root-container'>
          <RootSelector onRootSelect={ onRootSelect }/>
          <div className='im-hierarchy-widget' ref='modalRoot'/>
        </div>
      </div>
    );
  }
}
