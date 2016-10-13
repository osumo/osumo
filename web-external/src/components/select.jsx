import React from 'react';

import FileSelector from './fileSelector';

export default class Select extends React.Component {
  componentWillMount () {
    const {
      inpspec,
      folder,
      options
    } = this.props;

    if (inpspec.onlyNames || inpspec.preferredNames) {
      let match = new RegExp(inpspec.onlyNames || inpspec.preferredNames);
      for (let idx = 0; idx < options.length; idx += 1) {
        options[idx].idx = idx;
      }
      options.sort(function (a, b) {
        a.matched = !!match.test(a.name);
        b.matched = !!match.test(b.name);
        if (a.matched !== b.matched) {
          return a.matched ? -1 : 1;
        }
        return a.idx - b.idx;
      });
    }

    if (folder) {
      this.fileSelector = <FileSelector
                            folder={folder}
                            itemSelected={this.addOption.bind(this)} />;
    }

    this.setState(Object.assign({}, this.props));
  }

  render () {
    const {
      className,
      onChange,
      inpspec,
      selected,
      options
    } = this.state;

    return <div>
      <select
        className={className}
        onChange={onChange}
        value={selected}
        data-reference={inpspec.key}
        key={inpspec.key}
        ref={c => this.component = c}>
          {
            options.map(item => inpspec.onlyNames && !item.matched ? undefined :
              <option key={item._id} value={item._id}>{item.name}</option>)
          }
      </select>

      {this.fileSelector}
    </div>;
  }

  addOption (item) {
    // Make the new item appear in the list.
    item.matched = true;

    this.setState(oldState => ({
      options: [...oldState.options, item],
    }));
  }
}
