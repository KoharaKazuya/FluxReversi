import React from 'react';
import CellToken from '../constants/CellToken';
import ReversiPlayers from '../constants/ReversiPlayers';
import ReversiActionCreator from '../actions/ReversiActionCreator';

export default class ReversiPlayer extends React.Component {
  onChange(e) {
    ReversiActionCreator.changePlayer(this.props.player.token, e.target.value);
  }

  render() {
    const player = this.props.player;
    const tokenName = ((token) => {
      if (token === CellToken.Black) { return '黒'; }
      if (token === CellToken.White) { return '白'; }
    })(player.token);

    const playerTypes = Object.keys(ReversiPlayers).map((key) => {
      const value = ReversiPlayers[key];
      return (
        <option value={ value } key={ value }>{ value }</option>
      );
    });

    return (
      <div>
        <span>{ tokenName }: </span>
        <select value={ player.type } onChange={ (e) => this.onChange(e) }>
          { playerTypes }
        </select>
      </div>
    );
  }
}

ReversiPlayer.propTypes = {
  player: React.PropTypes.object.isRequired,
};
