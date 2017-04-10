
import { connect } from 'react-redux';

import Upload from '../body/upload';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';
import scatter from '../../utils/scatter';

import ItemModel from 'girder/models/ItemModel';

const uploadAndTag = (handle, metaType, bytesHandler, dispatch) => {
  return (
    dispatch(actions.ensurePrivateDirectory())
    .then((parent) => dispatch(actions.uploadFile(
      handle,
      {
        callbacks: {
          onChunk: (info) => {
            let { bytes } = info;
            bytesHandler(bytes);
          }
        },

        metaData: [
          ['sumoFileType', 'dataBlock'],
          ['sumoDataType', metaType]
        ]
      },
      parent
    )))

    .then(({ item }) => item)
  );
};

const UploadContainer = connect(
  ({ upload }) => (upload),

  (dispatch) => ({
    onReset: () => {},
    onFileDragIn: (e) => {
      (
        dispatch(actions.updateUploadBrowseText('Drop files here'))
        .then(() => dispatch(
          actions.setUploadModeToDragging()
        ))
      )
    },
    onFileDragOut: (e) => {
      (
        dispatch(actions.updateUploadBrowseText(null))
        .then(() => dispatch(
          actions.setUploadModeToDefault()
        ))
      )
    },
    onFileDragOver: null,
    onFileClick: null,
    onNewFiles: (files) => {
      (
        dispatch(actions.addUploadFileEntries(files))
        .then(() => dispatch(
          actions.setUploadModeToDefault()
        ))
      )
    },
    onFileEntryTypeChange: (index, type) => {
      dispatch(actions.updateUploadFileEntry(index, { metaType: type }))
    },
    removeFileEntry: (index) => {
      dispatch(actions.removeUploadFileEntry(index))
    },
    updateFileEntryUploaded: (index, uploaded) => {
      dispatch(actions.updateUploadFileEntry(index, { uploaded }))
    },
    onUploadSubmit: (fileEntries) => {
      let totalWork;
      let currentWork;

      const bytesHandler = (index) => {
        let fileUploaded = 0;
        return (bytes) => {
          currentWork += bytes;
          fileUploaded += bytes;
          (
            dispatch(actions.updateUploadProgress(currentWork, totalWork))
            .then(() => dispatch(actions.updateUploadFileEntry(
              index, { uploaded: fileUploaded }
            )))
          );
        };
      };

      (
        dispatch(actions.setUploadModeToUploading())

        .then(() => {
          totalWork = (
            fileEntries
              .map(({ handle: { size } }) => size)
              .reduce((a, b) => a + b, 0)
          );

          currentWork = 0;

          return dispatch(
            actions.updateUploadProgress(currentWork, totalWork)
          );
        })

        .then(() => Promise.all([
          dispatch(actions.ensurePrivateDirectory()),
          dispatch(actions.ensureScratchDirectory())
        ]))

        .then(() => (
          Promise.all(
            fileEntries.map(({ handle, metaType }, index) => (
              uploadAndTag(handle, metaType, bytesHandler(index), dispatch)
            ))
          )
        ))

        .then(() => dispatch(actions.updateUploadStatusText('')))
        .then(() => dispatch(actions.setUploadModeToDone()))
        .then(() => dispatch(actions.updateUploadStatusText(
          'Files uploaded successfully!')))
      )
    },
    onReset: () => dispatch(actions.resetUploadState())
  })
)(Upload);

export default UploadContainer;
