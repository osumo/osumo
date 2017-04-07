import React from 'react';
import TextField from '../../../common/text-field.jsx';

import { TIMES } from '../../../../constants';

const addEntries = (currentEntries, newEntries) => {
  let result = [].concat(currentEntries);
  (
    newEntries
    .forEach((e) => {
      if (result.indexOf(e) < 0) {
        result.push(e);
      }
    })
  );

  return result;
};

class FeatureSelection extends React.Component {
  render () {
    let {
      action,
      mainAction,
      onAction,
      onStateChange,
      state
    } = this.props;

    action = action || mainAction;
    state = state || {};

    let {
      candidates,
      currentText,
      value: chosenSet,
      extendedText,
      buttonVisible
    } = state;

    candidates = candidates || [];
    currentText = currentText || '';
    chosenSet = chosenSet || [];
    extendedText = extendedText || '';
    buttonVisible = buttonVisible || false;

    const handleNewEntries = () => {
      onStateChange({
        value: addEntries(
          chosenSet,
          (
            [state.currentText].concat(
              extendedText.split('\n')
            )

            .map((s) => (
              s
              .split(' ')
              .filter(({ length }) => length)
              .join(' ')
            ))

            .filter(({ length }) => length)
          )
        ),

        currentText: '',
        extendedText: ''
      });

      onAction(action, '');
    };

    return (
      <div>
        <div
          className='col-md-6'
          style={{
            paddingRight: 0
            // verticalAlign: 'top',
            // marginRight: 2
          }}
        >
          <label>Search for features</label>
          <br />
          <div
            className='col-md-10'
            style={{
              marginRight: 0,
              paddingRight: 0
            }}
          >
            <input
              className='form-control'
              list='types'
              onChange={(e) => {
                let { target: { value: currentText } } = e;
                onStateChange({ currentText });
                onAction(action, currentText);
              }}

              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewEntries();
                }
              }}

              placeholder='Enter Feature'
              style={{
                // width: 200,
                // display: 'inline',
                // verticalAlign: 'top'
              }}
              type='search'
              value={currentText}
            />
            <datalist id='types'>
              {candidates.map(({id, description}) => (
                <option key={id} value={id}>{description}</option>
              ))}
            </datalist>
          </div>
          <div
            className='col-md-2'
            style={{
              marginRight: 0,
              padding: 0
            }}
          >
            <button
              className='btn btn-primary'
              onClick={(e) => {
                e.preventDefault();
                handleNewEntries();
              }}
              style={{
                margin: 0
                // marginRight: 1,
                // paddingTop: 8,
                // paddingLeft: 7,
                // height: 33,
                // width: 35,
                // verticalAlign: 'top'
              }}
            >
              <i className='icon-plus' />
            </button>
          </div>
          <br />
          <div
            className='col-md-12'
            style={{
              paddingRight: 19
            }}
          >
            <div
              className='form-control'
              style={{
                paddingLeft: 0,
                height: 164,
                overflowX: 'hidden',
                overflowY: 'auto'
                // display: 'inline-block',
                // paddingRight: 5
              }}
            >
              {chosenSet.map((value) => (
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
                        value: chosenSet.filter((e) => (e !== value))
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
              ))}
            </div>
          </div>
        </div>

        <div
          className='col-md-6'
          style={{
            paddingLeft: 0
          }}
        >
          <label>Enter multiple features</label>
          <div
            className='col-md-12'
            style={{
            }}
          >
            <textarea
              onChange={(e) => {
                let { target: { value: extendedText } } = e;
                onStateChange({ extendedText });
              }}
              className='form-control'
              rows='2'
              cols='50'
              value={extendedText}
              style={{
                // width: 239,
                // margin: 0,
                // maxWidth: 239,
                // minWidth: 239,
                minHeight: 199,
                height: 199,
                maxHeight: 199
              }}
              default='Enter Multiple Features'
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FeatureSelection;
