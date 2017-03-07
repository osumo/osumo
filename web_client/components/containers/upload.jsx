
import { connect } from 'react-redux';

import Upload from '../body/upload';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';

const UploadContainer = connect(
  ({ upload }) => (upload),

  (dispatch) => ({
    onReset: () => {},
    onFileDragIn: (e) => {},
    /*
      this.setState({
        browseText: 'Drop files here',
        mode: modes.FILE_DRAGGING
      });
    */
    onFileDragOut: (e) => {},
    /*
      this.setState({
        browseText: null,
        mode: modes.DEFAULT
      });
    */
    onFileDragOver: null,
    onFileClick: null,
    onNewFiles: (files) => {},
    /*
      let { fileEntries } = this.state;

      let newFiles = new Array(files.length);
      for(let i=0; i<files.length; ++i) {
        let { name, size, type } = files[i];
        newFiles[i] = {
          handle: files[i],
          metaType: null,
          name,
          size,
          type,
          uploaded: 0
        };
      }

      this.setState({
        fileEntries: fileEntries.concat(newFiles),
        mode: modes.DEFAULT
      });
    */
    onFileEntryTypeChange: (index, type) => {},
    /*
      let { fileEntries } = this.state;

      let newFileEntries = fileEntries.map((e, j) => (
        index === j
          ? { ...e, metaType: type }
          : e
      ));

      this.setState({ fileEntries: newFileEntries });
    */
    removeFileEntry: (index) => {},
    /*
      let { fileEntries } = this.state;

      let newFileEntries = fileEntries.filter((_, j) => (
        index !== j
      ));

      this.setState({ fileEntries: newFileEntries });
    */
    updateFileEntryUploaded: (index, uploaded) => {},
    /*
      let { fileEntries } = this.state;
      fileEntries[index].uploaded = uploaded;
      this.setState({ fileEntries });
    */
    onUploadSubmit: (fileEntries) => {},
    /*
      this.setState({ mode: modes.UPLOADING });

      let totalWork = (
        fileEntries
          .map(({ handle: { size } }) => size)
          .reduce((a, b) => a + b, 0)
      );

      let currentWork = 0;

      this.setState({ progress: currentWork, progressGoal: totalWork });

      let actions = require('../../../actions');
      let { store } = require('../../../globals');
      let { Promise } = require('../../../utils/promise');
      let promise = (
        Promise.all(
          fileEntries.map(({ handle, type, uploaded }, index) => {
            let newlyUploaded = 0;

            return (
              (
                store.dispatch(actions.uploadFile(
                  handle, {
                    callbacks: {
                      onChunk: (info) => {
                        let { bytes } = info;
                        currentWork += bytes;
                        newlyUploaded += bytes;
                        this.setState({ progress: currentWork });
                        this.updateFileEntryUploaded(index, uploaded + newlyUploaded);
                      }
                    }
                  }
                ))

                .then(({ file }) => new Promise((resolve, reject) => {
                  let mod = new ItemModel({ _id: file.attributes.itemId })
                  let req = mod.fetch();
                  req.done(() => { resolve(mod); });
                  req.error(() => { reject(new Error()); });
                }))

                .then(
                  (item) => [item, type]
                )
              )
            );
          })
        )

        .then((entries) => Promise.all(
          entries.map(([item, type]) => new Promise((resolve, reject) => {
            if (type) {
              item.addMetadata(
                'sumoDataType',
                type,
                () => resolve(item),
                () => reject(new Error())
              );
            } else {
              resolve(item);
            }
          }))
        ))

        .then(
          () => this.setState({
            mode: modes.UPLOAD_DONE,
            fileEntries: [],
            statusText: 'Files uploaded successfully!'
          })
        )
      );
    */
    onReset: () => {}
    /*
      this.state = {
        browseText: null,
        fileEntries: [],
        mode: modes.DEFAULT,
        progress: 0,
        progressGoal: 0,
        statusText: null,
        subtitle: 'Upload local data to SUMO',
        title: 'Upload Data',
        validationFailedMessage: null
      };
    */
  })
)(Upload);

export default UploadContainer;
