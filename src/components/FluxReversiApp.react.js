import React from 'react';

export default class FluxReversiApp extends React.Component {
  constructor() {
    super();
    this.state = {
      count: 1,
    };
  }

  render() {
    return (
      <div>{ this.state.count }</div>
    );
  }
}
