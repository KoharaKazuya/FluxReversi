import React from 'react';
import ReversiCell from './ReversiCell.react';

export default class ReversiTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const lines = this.props.cells;
    return (
      <table><tbody>
        { lines.map((line, i) => {
          return (
            <tr key={ i }>
            { line.map((cell, j) => {
              return (
                <ReversiCell token={ cell } onClick={ () => this.props.onCellClick(i, j) } key={ j } />
              );
            }) }
            </tr>
          );
        }) }
      </tbody></table>
    );
  }
}

ReversiTable.propTypes = {
  cells: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
  onCellClick: React.PropTypes.func,
};
