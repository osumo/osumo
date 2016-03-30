/* globals $ */

import React from 'react';

import ParallelSetsComponent from './parallelsets';

export default class ProcessDataComponent extends React.Component {
  constructor (props) {
    super(props);
    this.request = this.props.rest;
  }

  componentWillMount () {
    let initialState = {
      /* The folder names are used to look up where to load and store data */
      dataFolderName: 'OSUMO Inputs',
      targetFolderName: 'OSUMO Results',
      inputs: {}
    };
    this.setState(initialState);
    this.inputDefaults = {};  /* populated when controls are rendered */
    let m_this = this;

    /* from girder/plugins/jobs/server/constants.py */
    this.JobStatus = {
      INACTIVE: 0,
      QUEUED: 1,
      RUNNING: 2,
      SUCCESS: 3,
      ERROR: 4,
      CANCELED: 5
    };

    /* Define functions */

    /* Get the current taskspec.
     *
     * @param {string} taskkey optional task key to match.  If not specified,
     *      use the current state's taskkey.
     * @return {object} the select task specification.
     */
    this.getTaskSpec = function (taskkey) {
      taskkey = taskkey === undefined ? this.state.taskkey : taskkey;
      for (var idx in this.state.tasks) {
        let taskspec = this.state.tasks[idx];
        if (taskkey === taskspec.key) {
          return taskspec;
        }
      }
      return {};
    };

    /* Get the input and output folder ids, if they haven't been set yet.
     *
     * @param {function} callback function to call when both IDs are present.
     */
    this.getInputAndOutputFolders = function (callback) {
      if (this.foldersRequest) {
        this.foldersRequest.abort();
      }
      let folders = [
        {id: 'dataFolderId', name: 'dataFolderName'},
        {id: 'targetFolderId', name: 'targetFolderName'}
      ];
      let state = this.state || initialState;
      for (let folder of folders) {
        if (state && !this[folder.id]) {
          let folderName = state[folder.name];
          this.foldersRequest = this.request({path: 'folder', data: {
            text: '"' + folderName + '"',
            sort: 'created',
            sortdir: -1
          }});
          this.foldersRequest.done(function (resp) {
            m_this[folder.id] = resp.response[0]._id;
            m_this.getInputAndOutputFolders(callback);
            return null;
          });
          return;
        }
      }
      callback.call(this);
    };

    /* Fetch the list of items based on the current state's data folder.
     */
    this.fetchItems = function () {
      if (this.itemsRequest) {
        this.itemsRequest.abort();
      }
      if (!this.dataFolderId || !this.targetFolderId) {
        this.getInputAndOutputFolders(this.fetchItems);
        return;
      }
      this.itemsRequest = this.request({path: 'item', data: {
        folderId: this.dataFolderId,
        sort: 'updated',
        sortdir: -1
      }});
      this.itemsRequest.done(function (resp) {
        m_this.setState({
          items: resp.response
        });
      });
    };

    /* Respond to the change in the selected task.
     *
     * @param {object} event the event that triggered the change.
     */
    this.changeTask = function (event) {
      m_this.setState({taskkey: event.target.value});
    };

    /* Respond to a change in any task control.
     *
     * @param {object} event the event that triggered the change.
     */
    this.changeTaskInput = function (event) {
      let inputs = m_this.state.inputs;
      inputs[$(event.target).attr('data-reference')] = event.target.value;
      m_this.setState({inputs: inputs});
    };

    /* Run a task.
     *
     * @param {object} event the event that triggered the change.
     */
    this.process = function (event) {
      let params = $.extend({}, m_this.inputDefaults, m_this.state.inputs,
                            {taskkey: m_this.state.taskkey});
      let task = m_this.getTaskSpec();
      for (let idx in task.parameters || []) {
        let par = task.parameters[idx];
        if (params[par.key] === undefined &&
            m_this.state[par.key] !== undefined) {
          params[par.key] = m_this.state[par.key];
        }
        if (params[par.key] === undefined &&
            m_this[par.key] !== undefined) {
          params[par.key] = m_this[par.key];
        }
      }
      m_this.setState({
        resultMessage: [],
        processTaskKey: m_this.state.taskkey
      });
      if (m_this.progressRequest) {
        for (let idx in m_this.progressRequest) {
          m_this.progressRequest[idx].abort();
        }
      }
      if (m_this.progressPollTimer) {
        window.clearTimeout(m_this.progressPollTimer);
      }
      m_this.progressRequest = [m_this.request({path: 'osumo', method: 'POST', data: params})];
      m_this.progressRequest[0].done(m_this.pollProgress);
    };

    /* Check the current job status.  If it hasn't completed, wait a short time
     * and check it again.  If it errors, show the error log.  If it succeeds,
     * show the resultant files (this will need to be changed to show the
     * resultant visualization instead).
     *
     * @param {object} resp the current job status.
     */
    this.pollProgress = function (resp) {
      m_this.progressRequest = [];
      m_this.currentJob = resp.response;
      let job = resp.response;
      let status = 'RUNNING';
      for (var statusKey in m_this.JobStatus) {
        if (job.status === m_this.JobStatus[statusKey]) {
          status = statusKey;
        }
      }
      let progress = status + ' - ' + job.updated;
      if (job.status === m_this.JobStatus.ERROR) {
        if (job.log.indexOf('Traceback') >= 0) {
          progress += ' - ' + job.log.substr(0, job.log.indexOf('Traceback'));
        } else {
          progress += ' - ' + job.log;
        }
      }
      m_this.setState({progressMessage: progress});
      if (job.status !== m_this.JobStatus.ERROR &&
          job.status !== m_this.JobStatus.SUCCESS &&
          job.status !== m_this.JobStatus.CANCELED) {
        m_this.progressPollTimer = window.setTimeout(function () {
          m_this.progressPollTimer = null;
          m_this.progressRequest = [m_this.request({path: 'job/' + m_this.currentJob['_id']})];
          m_this.progressRequest[0].done(m_this.pollProgress);
        }, 1000);
        return;
      }
      if (job.status !== m_this.JobStatus.SUCCESS) {
        return;
      }
      let task = m_this.getTaskSpec(m_this.state.processTaskKey);
      for (let key in job.processedFiles) {
        job.processedFiles[key].output = {};
        for (let outkey in task.outputs) {
          if (job.processedFiles[key].name !== undefined &&
                job.processedFiles[key].name === task.outputs[outkey].name) {
            job.processedFiles[key].output = task.outputs[outkey];
          }
        }
      }
      job.processedFiles.sort(function (a, b) {
        let ashow = a.output.show;
        let bshow = b.output.show;
        if (ashow !== bshow) {
          if (ashow === undefined || ashow === false) {
            return 1;
          }
          if (bshow === undefined || bshow === false) {
            return -1;
          }
          return ashow > bshow ? 1 : -1;
        }
        return a.name > b.name ? 1 : -1;
      });
      for (let key in job.processedFiles) {
        if (job.processedFiles[key].output.show !== false) {
          let ajax = m_this.showResultsItem(key, job.processedFiles[key], job);
          if (ajax) {
            m_this.progressRequest.push(ajax);
          }
        }
      }
      /* If we don't return null, a warning about promises is shown.  We take
       * care of that elsewhere. */
      return null;
    };

    /**
     * Show a results item.  The corresponding item is downloaded and presented
     * as plain text.
     *
     * @param {string} key the name of result.
     * @param {object} details the processed file details for the result
     * @param {object} job the job object with information about this item.
     * @returns {object} ajax object if a further call is being made.
     */
    this.showResultsItem = function (key, details, job) {
      let results = this.state.resultMessage;
      let pos = results.length;
      results.push([<div key={'key_' + pos}>{details.name}</div>]);
      this.setState({resultMessage: results});
      let ajax = null;
      switch (details.output.show) {
        case 'image':
          results[pos].push(<img key={'data_' + pos} src={
              this.props.apiRoot + '/file/' + details.fileId +
              '/download?image=.png'}></img>);
          this.setState({resultMessage: results});
          break;
        case 'parallelSets':
          ajax = this.request({
            path: 'file/' + details.fileId + '/download'
          });
          ajax.done(function (resp) {
            let results = m_this.state.resultMessage;
            results[pos].push(<ParallelSetsComponent
              key={'data_' + pos}
              data={resp.response}
              task={m_this.getTaskSpec(m_this.state.processTaskKey)}
              job={job}
            />);
            m_this.setState({resultMessage: results});
          });
          break;
        default:
          ajax = this.request({
            path: 'file/' + details.fileId + '/download',
            dataType: 'text'
          });
          ajax.done(function (resp) {
            let results = m_this.state.resultMessage;
            results[pos].push(<div key={'data_' + pos}>{resp.response}</div>);
            m_this.setState({resultMessage: results});
          });
          break;
      }
      return ajax;
    };

    /* Perform intitial data load */

    this.tasksRequest = this.request({path: 'osumo/tasks'});
    this.tasksRequest.done(function (resp) {
      m_this.setState({
        tasks: resp.response
      });
      if (!m_this.state.taskkey && m_this.state.tasks.length > 0) {
        m_this.setState({taskkey: m_this.state.tasks[0].key});
      }
    });
    this.fetchItems();
  }

  componentWillUnmount () {
    this.tasksRequest.abort();
    this.itemsRequest.abort();
  }

  render () {
    let idx;

    if (!this.state || !this.state.tasks || !this.state.items) {
      return (
        <div id='g-app-body-container' className='g-default-layout'>Loading
        </div>
      );
    }

    let functionSelector = (
      <div id='function-selector'>
        <label className='control-label'>Task: </label>
        <select id='function' className='form-control' onChange={this.changeTask} value={this.state.taskkey}>{
          this.state.tasks.map(function (task) {
            return <option key={task.key} value={task.key}
                    title={task.description}>{task.name}</option>;
          })
        }</select>
        <div className='task-desc g-item-info-header'>{this.getTaskSpec().description || ''}</div>
      </div>
    );
    let functionControls = [];
    let task = this.getTaskSpec();
    /* create task-specific controls */
    for (idx in task.inputs || []) {
      let inpspec = task.inputs[idx];
      let defaultValue = inpspec.default;
      let ctl = [<label className='control-label' key='label'>{inpspec.name} </label>];
      switch (inpspec.type) {
        case 'item':
          let items = this.state.items;
          // we should filter items based on the subtype
          ctl.push(<select className='form-control'
              onChange={this.changeTaskInput}
              value={this.state.inputs[inpspec.key]}
              data-reference={inpspec.key} key={inpspec.key}>{
            items.map(function (item) {
              return <option key={item._id} value={item._id}>{item.name}</option>;
            })
          }</select>);
          defaultValue = items[0]._id;
          break;
        case 'boolean':
          ctl.push(<input type='checkbox' className='form-control'
              onChange={this.changeTaskInput}
              defaultChecked={inpspec.default === true}
              value={this.state.inputs[inpspec.key]}
              data-reference={inpspec.key} key={inpspec.key}></input>);
          break;
        case 'integer': case 'float': case 'text':
          // we should add code to validate the input type
          ctl.push(<input type='text' className='form-control'
              onChange={this.changeTaskInput}
              defaultValue={inpspec.default}
              value={this.state.inputs[inpspec.key]}
              data-reference={inpspec.key} key={inpspec.key}></input>);
          break;
        case 'enum':
          ctl.push(<select className='form-control'
              onChange={this.changeTaskInput}
              value={this.state.inputs[inpspec.key]}
              data-reference={inpspec.key} key={inpspec.key}>{
            inpspec.enum.map(function (entry) {
              if (!entry.id && !entry.name) {
                entry = {id: entry, name: entry};
              }
              return <option key={entry.id} value={entry.id}>{entry.name}</option>;
            })
          }</select>);
          defaultValue = inpspec.default || inpspec.enum[0].id || inpspec.enum[0];
          break;
        default:
          console.log('control type ' + inpspec.type + ' not implemented');
          break;
      }
      functionControls.push(<div className='function-control' title={inpspec.description} key={inpspec.key}>{ctl}</div>);
      if (defaultValue !== undefined) {
        this.inputDefaults[inpspec.key] = defaultValue;
      }
    }

    return (
      <div id='g-app-body-container' className='g-default-layout'>
        { functionSelector }
        <div id='function-controls'>{ functionControls }</div>
        <button className='btn btn-default' id='process'
         onClick={this.process}>Process</button>
        <div id='progress'>{ this.state.progressMessage }</div>
        <div id='results'>{ this.state.resultMessage }</div>
      </div>
    );
  }
}
