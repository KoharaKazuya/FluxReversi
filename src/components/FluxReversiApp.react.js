import React from 'react';
import ReversiStore from '../stores/ReversiStore';
import ReversiActionCreator from '../actions/ReversiActionCreator';
import ReversiTable from './ReversiTable.react';
import CellToken from '../constants/CellToken';

export default class FluxReversiApp extends React.Component {
  constructor() {
    super();
    this.state = ReversiStore.getState();
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
      <div>
        <div>{ JSON.stringify(this.state) }</div>
        <ReversiTable cells={ this.state.cells } />
        <div>{
          this.state.nextTurn === CellToken.Black ?
            '次のターンは 黒 です' : '次のターンは 白 です'
        }</div>
      </div>
    );
  }
}
