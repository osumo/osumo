import React from 'react';
import $ from 'jquery';

import View from 'girder/views/View';
import HierarchyWidget from 'girder/views/widgets/HierarchyWidget';
import CollectionModel from 'girder/models/CollectionModel';
import UserModel from 'girder/models/UserModel';
import FolderModel from 'girder/models/FolderModel';

import RootSelector from '../../common/root-selector';

/* hacked to remove the download and view links */
/* TODO(opadron): replace this with flags from girder/girder#1688 once we
 * migrate to Girder 2.0 */
// import customItemListTemplate from './item-list-template.jade';
// girder.templates.itemList = customItemListTemplate;

/* hacked to remove the metadata section */
/* TODO(opadron): replace this with flags from girder/girder#1688 once we
 * migrate to Girder 2.0 */
// import customHierarchyTemplate from './hierarchy-template.jade';
// girder.templates.hierarchyWidget = customHierarchyTemplate;


const DUMMY_MODAL = {
  off: () => null,
  render: () => null,
  stopListening: () => null,
  undelegateEvents: () => null
};

export default class Body extends React.Component {
  clearModal () {
    const $modalRoot = $( this.refs.modalRoot );

    this.modal.undelegateEvents();
    this.modal.off();
    $modalRoot.removeData().unbind();
    $modalRoot.empty();
    this.modal.stopListening();
  }

  setModal () {
    let {
      folder,
      folderSelectMode,
      itemFilter,
      onItemSelect,
      showItems,
      parentType
    } = this.props;

    this.modal = (
      folder ? new HierarchyWidget({
        el: $( this.refs.modalRoot ),
        parentView: null,
        parentModel: (
          new (
            parentType === 'collection' ?
              CollectionModel

            : parentType === 'user' ?
              UserModel

            :
              FolderModel
          )(folder)
        ),
        showActions: false,
        showMetadata: false,
        showItems: showItems,
        downloadLinks: false,
        showSizes: false,
        viewLinks: false,
        checkboxes: false,
        routing: false,
        itemFilter,
        onFolderSelect: (
          folderSelectMode
            ? (folder) => onItemSelect(folder.attributes)
            : null
        ),
        onItemClick: (item) => onItemSelect(item.attributes)
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
