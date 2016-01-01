import React from 'react';
import CellToken from '../constants/CellToken';

export default class ReversiCell extends React.Component {
  render() {
    let cellText = '　';
    switch (this.props.token) {
      case CellToken.White:
        cellText = '○';
        break;
      case CellToken.Black:
        cellText = '●';
        break;
      default:
    }
    const style = {
      backgroundColor: '#EEE',
      cursor: 'pointer',
    };
    return (
      <td onClick={ this.props.onClick } style={ style }>
        { cellText }
      </td>
    );
  }
}

ReversiCell.propTypes = {
  token: React.PropTypes.number,
  onClick: React.PropTypes.func,
};
