import React, { Component } from 'react';

import ExampleComponent from 'obj-viewer';

const datasets = {
  src1: {
    one: 'i am a string',
    two: 12,
    // three: 123.22,
    // nully: null,
    // notdef: undefined,
    // isnan: NaN,
    // isbool: true,
    // func: () => {
    //   console.log('I is func');
    // },
    structure: {
      prop: 'string now',
      excludeme: {
        nested: true
      }
    },
    list: [
      1,
      'hello',
      {
        test: {
          redactme: 'unredacted'
        }
      }
    ]
    // list: [
    //   1,
    //   'hello',
    //   {
    //     propnest: 'i am nested'
    //   }
    // ]
  },
  src2: {
    one: 'i am a string too',
    two: 13,
    // three: 111111,
    // nully: 'not null anymore',
    // notdef: undefined,
    // isnan: NaN,
    structure: {
      prop: 'string now'
    },
    list: [
      11,
      'hello2',
      {
        test: {
          redactme: 'unredacted'
        }
      }
    ]
  }
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: datasets.src1
    };
  }

  onClick = name => () => {
    this.setState({
      data: datasets[name]
    });
  };

  render() {
    return (
      <div>
        <ExampleComponent
          src={this.state.data}
          redactKeys={['structure.excludeme', 'list.*.test.redactme']}
        />
        <button onClick={this.onClick('src1')}>src1</button>
        <button onClick={this.onClick('src2')}>src2</button>
      </div>
    );
  }
}
