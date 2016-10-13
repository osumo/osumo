import React from 'react';

import FileSelector from './fileSelector';

export default class Select extends React.Component {
  componentWillMount () {
    const {
      inpspec,
      folder,
      options
    } = this.props;

    this.folder = folder;
    this.id = inpspec.key;

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

    this.options = options;
  }

  render () {
    const {
      className,
      onChange,
      selected,
      inpspec
    } = this.props;

    let fileSelector;
    if (this.folder) {
      fileSelector = <FileSelector
                        folder={this.folder}
                        itemSelected={this.itemSelected.bind(this)} />;
    }

    return <div>
      <select
        className={className}
        onChange={onChange}
        value={selected}
        data-reference={inpspec.key}
        key={inpspec.key}>
          {
            this.options.map(item => inpspec.onlyNames && !item.matched ? undefined :
              <option key={item._id} value={item._id}>{item.name}</option>)
          }
      </select>

      {fileSelector}
    </div>;
  }

  itemSelected (item) {
    console.log(`item selected in ${this.id}:`, item);
  }
}
