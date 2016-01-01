import React from 'react';
import ReversiStore from '../stores/ReversiStore';
import ReversiActionCreator from '../actions/ReversiActionCreator';
import ReversiTable from './ReversiTable.react';
import ReversiPlayer from './ReversiPlayer.react';
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

  _start() {
    ReversiActionCreator.startGame();
  }

  render() {
    let infoText;
    if (this.state.running) {
      if (this.state.nextTurn === CellToken.Black) {
        infoText = '次のターンは 黒 です';
      } else {
        infoText = '次のターンは 白 です';
      }
    } else {
      infoText = 'ゲーム終了！';
      if (this.state.winner === CellToken.Black) {
        infoText += ' 黒 の勝利！';
      } else if (this.state.winner === CellToken.White) {
        infoText += ' 白 の勝利！';
      } else {
        infoText += ' 引き分け...';
      }
    }
    return (
      <div>
        <div>{ JSON.stringify(this.state) }</div>
        <ReversiTable cells={ this.state.cells } />
        <div>{ infoText }</div>
        <ReversiPlayer player={ this.state.players[CellToken.Black] } />
        <ReversiPlayer player={ this.state.players[CellToken.White] } />
        <button type="button" onClick={ this._start }>ゲーム開始（リセット）</button>
      </div>
    );
  }
}
