/* globals $ */

import React from 'react';
import { connect } from 'react-redux';

import { partial } from 'lodash';
import ParallelSetsComponent from './parallelsets';
import { apiRoot, rest } from '../../globals';
import Select from '../common/select';

import '../../style/process-data';

void ParallelSetsComponent;  // make my editor's linter happy.

class ProcessDataComponent extends React.Component {
  constructor (props) {
    super(props);
    this.request = this.props.rest;
  }

  componentWillMount () {
    let initialState = {
      /* The folder names are used to look up where to load and store data */
      dataFolderName: 'OSUMO Inputs',
      targetFolderName: 'OSUMO Results',
      /* This allows chaining tasks.  Once this is refactored into a more
       * reasonable component, another copy of the component should be shown
       * rather than this chaining method. */
      progressMessage: [],
      resultMessage: [],
      processTaskKey: [],
      tasklist: [],
      inputs: {}
    };
    this.setState(initialState);
    this.inputDefaults = {};  /* populated when controls are rendered */

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
    this.getTaskSpec = (taskkey) => {
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
    this.getInputAndOutputFolders = (callback) => {
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
          this.foldersRequest.done((resp) => {
            this[folder.id] = resp.response[0]._id;
            this[folder.id.slice(0, -2)] = resp.response[0];
            this.getInputAndOutputFolders(callback);
            return null;
          });
          return;
        }
      }
      callback.call(this);
    };

    /* Fetch the list of items based on the current state's data folder.
     */
    this.fetchItems = () => {
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
      this.itemsRequest.done((resp) => {
        this.setState({
          items: resp.response
        });
      });
    };

    /* Respond to the change in the selected task.
     *
     * @param {object} event the event that triggered the change.
     */
    this.changeTask = (event) => {
      this.setState({taskkey: event.target.value});
    };

    /* Respond to a change in any task control.
     *
     * @param {object} event the event that triggered the change.
     */
    this.changeTaskInput = (event) => {
      let inputs = this.state.inputs;
      inputs[$(event.target).attr('data-reference')] = event.target.value;
      this.setState({inputs: inputs});
    };

    /* Respond to a change in any task control.
     *
     * @param {object} event the event that triggered the change.
     */
    this.setTaskInput = (key, value) => {
      let inputs = {...this.state.inputs, [key]: value};
      this.setState({inputs: inputs});
    };

    /* Update the default that will be applied if nothing is changed.
     *
     * @param {string} key input key
     * @param {string} value default value
     */
    this.setInputDefault = (key, value) => {
      this.inputDefaults[key] = value;
    };

    /* Run a task.
     *
     * @param {number} position if set, this is the chained process position.
     * @param {object} event the event that triggered the change.
     */
    this.process = (position, event) => {
      position = position || 0;
      let taskkey = (position === 0 ? this.state.taskkey
                     : this.state.tasklist[position]);
      let params = {taskkey: taskkey};
      let task = this.getTaskSpec(taskkey);
      let inputs = [].concat(task.parameters || [], task.inputs || []);
      for (let idx in inputs) {
        let key = inputs[idx].key;
        let value = this.state.inputs[key];
        if (value === undefined) { value = this.inputDefaults[key]; }
        if (value === undefined) { value = this.state[key]; }
        if (value === undefined) { value = this[key]; }
        if (value !== undefined) {
          params[key] = value;
        }
      }
      let results = this.state.resultMessage.slice(0, position);
      results[position] = [];
      let processTaskKey = this.state.processTaskKey;
      processTaskKey[position] = taskkey;
      let progressMessage = this.state.progressMessage.slice(0, position);
      this.setState({
        resultMessage: results,
        processTaskKey,
        progressMessage
      });
      if (this.progressRequest) {
        for (let idx in this.progressRequest) {
          this.progressRequest[idx].abort();
        }
      }
      if (this.progressPollTimer) {
        window.clearTimeout(this.progressPollTimer);
      }
      this.progressRequest = [this.request({path: 'osumo', method: 'POST', data: params})];
      this.progressRequest[0].then(
        (...args) => this.pollProgress(position, ...args)).catch((error) => {
          let msg = 'Unknown error.  Check console.';
          if (error) {
            if (error.jqXHR && error.jqXHR.responseJSON &&
                error.jqXHR.responseJSON.message) {
              msg = error.jqXHR.responseJSON.message;
            } else if (error.errorThrown) {
              msg = error.errorThrown;
            }
          }
          let progressMessage = this.state.progressMessage;
          progressMessage[position] = msg;
          this.setState({progressMessage: progressMessage});
        });
    };

    /* Check the current job status.  If it hasn't completed, wait a short time
     * and check it again.  If it errors, show the error log.  If it succeeds,
     * show the resultant files (this will need to be changed to show the
     * resultant visualization instead).
     *
     * @param {number} position the chained process position.
     * @param {object} resp the current job status.
     */
    this.pollProgress = (position, resp) => {
      this.progressRequest = [];
      let job = resp.response;
      if (job.job && job.token) {
        this.currentJobToken = job.token;
        job = job.job;
      }
      this.currentJob = job;
      let status = 'RUNNING';
      for (var statusKey in this.JobStatus) {
        if (job.status === this.JobStatus[statusKey]) {
          status = statusKey;
        }
      }
      let progress = status + ' - ' + job.updated;
      if (job.status === this.JobStatus.ERROR) {
        if (job.log.indexOf('Traceback') >= 0) {
          progress += ' - ' + job.log.substr(0, job.log.indexOf('Traceback'));
        } else {
          progress += ' - ' + job.log;
        }
      }
      let progressMessage = this.state.progressMessage;
      progressMessage[position] = progress;
      this.setState({progressMessage: progressMessage});
      if (job.status !== this.JobStatus.ERROR &&
          job.status !== this.JobStatus.SUCCESS &&
          job.status !== this.JobStatus.CANCELED) {
        this.progressPollTimer = window.setTimeout(() => {
          this.progressPollTimer = null;
          this.progressRequest = [this.request({path: 'job/' + this.currentJob['_id'], data: {token: this.currentJobToken}})];
          this.progressRequest[0].done(
            (...args) => this.pollProgress(position, ...args));
        }, 1000);
        return;
      }
      if (job.status !== this.JobStatus.SUCCESS) {
        return;
      }
      let task = this.getTaskSpec(this.state.processTaskKey[position]);
      for (let key in job.processedFiles) {
        job.processedFiles[key].output = {};
        for (let outkey in task.outputs) {
          if (job.processedFiles[key].name !== undefined &&
                job.processedFiles[key].name === task.outputs[outkey].name) {
            job.processedFiles[key].output = task.outputs[outkey];
          }
        }
      }
      job.processedFiles.sort((a, b) => {
        let apos = a.output.position;
        let bpos = b.output.position;
        if (apos !== bpos) {
          if (apos === undefined || apos === false) {
            return 1;
          }
          if (bpos === undefined || bpos === false) {
            return -1;
          }
          return apos > bpos ? 1 : -1;
        }
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
          let ajax = this.showResultsItem(
            key, job.processedFiles[key], job, position);
          if (ajax) {
            this.progressRequest.push(ajax);
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
     * @param {number} position the chained process position.
     * @returns {object} ajax object if a further call is being made.
     */
    this.showResultsItem = (key, details, job, position) => {
      let results = this.state.resultMessage;
      let pos = results[position].length;
      results[position].push([]);
      if (details.output.displayName !== '') {
        results[position][pos].push(<div className='output-name' key={'key_' + pos}>{details.output.displayName || details.name}</div>);
      }
      if (details.output.notes) {
        results[position][pos].push(<div className='output-notes' key={'notes_' + pos}>{details.output.notes}</div>);
      }
      this.setState({resultMessage: results});
      let ajax = null;
      switch (details.output.show) {
        case 'image':
          results[position][pos].push(<img key={'data_' + pos} src={
              this.props.apiRoot + '/file/' + details.fileId +
              '/download?image=.png'}></img>);
          this.setState({resultMessage: results});
          break;
        case 'parallelSets':
          ajax = this.request({
            path: 'file/' + details.fileId + '/download'
          });
          ajax.done((resp) => {
            let results = this.state.resultMessage;
            results[position][pos].push(<ParallelSetsComponent
              key={'data_' + pos}
              data={resp.response}
              task={this.getTaskSpec(this.state.processTaskKey[position])}
              job={job}
              onNextTask={(...args) => this.onNextTask(position, ...args)}
            />);
            this.setState({resultMessage: results});
          });
          break;
        default:
          ajax = this.request({
            path: 'file/' + details.fileId + '/download',
            dataType: 'text'
          });
          ajax.done((resp) => {
            let results = this.state.resultMessage;
            results[position][pos].push(<div key={'data_' + pos}>{resp.response}</div>);
            this.setState({resultMessage: results});
          });
          break;
      }
      return ajax;
    };

    this.onNextTask = (position, task, job, inputs = {}) => {
      if (!task.nexttask) {
        return;
      }
      let stateInputs = this.state.inputs;
      Object.assign(stateInputs, inputs);
      for (let idx in task.nexttask.transfers || []) {
        let key = task.nexttask.transfers[idx];
        for (let fileidx in job.processedFiles || []) {
          if (key === job.processedFiles[fileidx].output.key) {
            stateInputs[key] = job.processedFiles[fileidx].fileId;
          }
        }
      }
      let tasklist = this.state.tasklist;
      tasklist[position + 1] = task.nexttask.task;
      this.setState({inputs: stateInputs, tasklist: tasklist});
      this.process(position + 1);
    };

    /* Perform intitial data load */

    this.tasksRequest = this.request({path: 'osumo/tasks'});
    this.tasksRequest.done((resp) => {
      this.setState({
        tasks: resp.response
      });
      if (!this.state.taskkey && this.state.tasks.length > 0) {
        this.setState({taskkey: this.state.tasks[0].key});
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
      return <div>'Loading'</div>;
    }

    let functionSelector = (
      <div id='function-selector' key='function-selector'>
        <label className='control-label'>Task: </label>
        <select id='function' className='form-control' onChange={this.changeTask} value={this.state.taskkey}>{
          this.state.tasks.map((task) => {
            if (task.show !== false) {
              return <option key={task.key} value={task.key}
                      title={task.description}>{task.name}</option>;
            }
          })
        }</select>
        <div className='task-desc g-item-info-header'>{this.getTaskSpec().description || ''}</div>
        <div className='task-notes'>{this.getTaskSpec().notes || ''}</div>
      </div>
    );
    let functionControls = [];
    let task = this.getTaskSpec();
    /* create task-specific controls */
    for (idx in task.inputs || []) {
      let inpspec = task.inputs[idx];
      let defaultValue = inpspec.default;
      let ctl = [<label className='control-label' key={'control-label-' + inpspec.key}>{inpspec.name} </label>];
      if (inpspec.notes) {
        ctl.push(<div className='control-notes' key={'control-notes-' + inpspec.key}>{inpspec.notes}</div>);
      }
      switch (inpspec.type) {
        case 'item': case 'file':
          const items = this.state.items.map(x => Object.assign({}, x));

          // we should filter items based on the subtype
          const inpspecCopy = Object.assign({}, inpspec);
          const input = this.state.inputs[inpspec.key];
          ctl.push(
            <Select
              key={inpspec.key}
              className='form-control'
              onChange={this.changeTaskInput}
              onSetItem={partial(this.setTaskInput, inpspec.key)}
              onSetDefault={partial(this.setInputDefault, inpspec.key)}
              selected={input}
              options={items}
              inpspec={inpspecCopy}
              folder={this.dataFolder} />
          );
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
            inpspec.enum.map((entry) => {
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

    let output = [];
    for (let idx in this.state.progressMessage) {
      output.push(<div key={'progress' + idx}>{ this.state.progressMessage[idx] }</div>);
      let results = [];
      for (let ridx in this.state.resultMessage[idx]) {
        results.push(<div key={'results' + idx + '_' + ridx}>{ this.state.resultMessage[idx][ridx] }</div>);
      }
      output.push(<div key={'results' + idx}>{results}</div>);
    }

    return (
      <div>
        { functionSelector }
        <div id='function-controls'>{ functionControls }</div>
        <button className='btn btn-default' id='process'
         onClick={(...args) => this.process(0, ...args)}>Process</button>
        {output}
      </div>
    );
    /*
        <div id='progress0'>{ this.state.progressMessage[0] }</div>
        <div id='results0'>{ this.state.resultMessage[0] }</div>
        <div id='progress1'>{ this.state.progressMessage[1] }</div>
        <div id='results1'>{ this.state.resultMessage[1] }</div>
    */
  }

  static get propTypes () {
    return {
      apiRoot: React.PropTypes.string,
      rest: React.PropTypes.func
    };
  }
}

export default connect(null, () => ({ apiRoot, rest }))(ProcessDataComponent);
