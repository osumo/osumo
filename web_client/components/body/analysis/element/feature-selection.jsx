import React from 'react';
import { isNil } from 'lodash';

import { TIMES } from '../../../../constants';

const addEntries = (currentEntries, newEntries) => {
  let result = [].concat(currentEntries);
  (
    newEntries
    .map((s) => (
      s
      .split(' ')
      .filter(({ length }) => length)
      .join(' ')
    ))
    .filter(({ length }) => length)
    .forEach((e) => {
      if (result.indexOf(e) < 0) {
        result.push(e);
      }
    })
  );

  return result;
};

class FeatureSelection extends React.Component {
  componentWillMount () {
    this.randomId = `candidates-${Math.floor(1e17 * Math.random())}`;
  }

  render () {
    let {
      action,
      mainAction,
      onAction,
      onStateChange,
      state = {}
    } = this.props;

    let {
      candidates = [],
      currentText = '',
      value: chosenSet = [],
      extendedText = '',
      singleMode,
      transitioning
    } = state;

    action = action || mainAction;
    singleMode = singleMode || isNil(singleMode);
    transitioning = Boolean(transitioning);

    const handleNewEntries = () => {
      if (singleMode) {
        onStateChange({
          value: addEntries(chosenSet, [currentText]),
          currentText: ''
        });

        onAction(action, '');
      } else {
        onStateChange({
          value: addEntries(chosenSet, extendedText.split('\n')),
          extendedText: ''
        });
      }
    };

    return (
      <div
        className='feature-select'
        style={{
          alignItems: 'center',
          display: 'flex',
          paddingBottom: 5,
          paddingTop: 5
        }}
      >
        <div
          className='input-group'
          style={{
            width: '45%',
            marginRight: '0.5%'
          }}
        >
          <span className='input-group-btn'>
            <button
              className='btn btn-default'
              type='button'
              style={{
                height: (singleMode ? 33 : 100),
                marginBottom: 0,
                marginTop: 0,
                minWidth: 70,
                transition: 'height 0.1s ease'
              }}
              onClick={(e) => {
                e.preventDefault();
                onStateChange({
                  singleMode: !singleMode,
                  transitioning: true
                });
              }}
            >
              {
                transitioning
                  ? (singleMode ? 'Multi' : 'Search')
                  : (singleMode ? 'Search' : 'Multi')
              }
            </button>
          </span>
          <input
            type='text'
            list={this.randomId}
            className='form-control'
            placeholder={transitioning ? '' : 'Search features'}
            style={{
              height: singleMode ? 33 : 100,
              transition: 'height 0.1s ease',
              ...(
                (singleMode || transitioning)
                  ? {} : { position: 'fixed', visibility: 'hidden' }
              )
            }}
            onTransitionEnd={(e) => {
              onStateChange({ transitioning: false });
            }}
            onChange={(e) => {
              let { value } = e.target;
              onStateChange({ currentText: value });
              onAction(action, value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleNewEntries();
              }
            }}
            value={transitioning ? '' : currentText}
          />
          <datalist id={this.randomId}>
            {
              candidates.map(({ id, description }) => (
                <option key={id} value={id}>{description}</option>
              ))
            }
          </datalist>
          <textarea
            className={
              'form-control' + (
                (singleMode || transitioning)
                  ? ' hidden'
                  : ''
              )
            }
            style={{
              marginTop: 0,
              height: singleMode ? 33 : 100,
              resize: 'none'
            }}
            onChange={(e) => {
              let { value } = e.target;
              onStateChange({ extendedText: value });
            }}
            value={extendedText}
          />
        </div>
        <button
          className='btn btn-primary'
          type='button'
          style={{
            width: 34,
            height: 33,
            paddingLeft: 6,
            paddingRight: 6
          }}
          onClick={(e) => {
            e.preventDefault();
            if (!transitioning) {
              handleNewEntries();
            }
          }}
        >
          <span className='icon-plus' />
        </button>
        <div
          className='display'
          style={{
            border: '1px solid lightgray',
            borderRadius: 3,
            height: 100,
            marginLeft: '0.5%',
            marginTop: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            width: '45%'
          }}
        >
          {
            chosenSet.map((value) => (
              <div key={value}>
                <button
                  style={{
                    verticalAlign: 'middle',
                    height: 20
                  }}
                  className='btn btn-xs btn-danger'
                  onClick={(e) => {
                    e.preventDefault();
                    onStateChange({
                      value: chosenSet.filter((entry) => (entry !== value))
                    });
                  }}
                >
                  {TIMES}
                </button>
                <h4
                  style={{
                    display: 'inline',
                    verticalAlign: 'middle'
                  }}
                >
                  {value}
                </h4>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export default FeatureSelection;
