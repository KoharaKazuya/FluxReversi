import React from 'react';
import ReversiStore from '../stores/ReversiStore';
import ReversiActionCreator from '../actions/ReversiActionCreator';

export default class FluxReversiApp extends React.Component {
  constructor() {
    super();
    this.state = {
      running: false,
    };
  }

  componentDidMount() {
    ReversiStore.addChangeListener(() => this._onChange());
    ReversiActionCreator.startGame();
  }

  _onChange() {
    this.setState(ReversiStore.getState());
  }

  render() {
    return (
      <div>{ JSON.stringify(this.state) }</div>
    );
  }
}
