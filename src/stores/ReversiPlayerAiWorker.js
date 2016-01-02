import ReversiEvalMachine from './ReversiEvalMachine';

const weight = [
  [120, -20, 20, 5, 5, 20, -20, 120],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [120, -20, 20, 5, 5, 20, -20, 120],
];

self.onmessage = (e) => {
  const { cells, token, depth } = e.data;
  const action = minMax(cells, token, depth).action;
  self.postMessage(action);
};

/**
 * 盤面の得点評価関数
 *
 * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
 * @param {CellToken} 得点を評価したいコマの色
 * @return {Number} 得点
 */
function evalScore(estimatedCells, token) {
  // 与えられた盤面に空きマスがなければ、重み付け関係なしにコマ数だけの評価をする
  if (! ReversiEvalMachine.hasEmptyCell(estimatedCells)) {
    // flatten
    const flattenCells = Array.prototype.concat.apply([], estimatedCells);
    const numOfToken = flattenCells.filter((cell) => cell === token).length;
    return numOfToken * 10000;  // 以下の評価と比較された場合、以下の評価を無視するために十分大きくする
  }

  let score = 0;
  const reversed = ReversiEvalMachine.reversedToken(token);
  for (let y = 0; y < estimatedCells.length; y++) {
    for (let x = 0; x < estimatedCells[y].length; x++) {
      if (estimatedCells[y][x] === token) {
        score += weight[y][x];
      } else if (estimatedCells[y][x] === reversed) {
        score -= weight[y][x];
      }
    }
  }
  return score;
}

function minMax(cells, token, depth) {
  if (depth === 0) {
    return {
      action: undefined,
      score: evalScore(cells, token),
    };
  }

  const reversed = ReversiEvalMachine.reversedToken(token);
  let bestAction = {
    action: undefined,
    score: Number.NEGATIVE_INFINITY,
  };
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      if (! ReversiEvalMachine.canPutInto(cells, x, y, token)) {
        continue;
      }

      const nextCells = ReversiEvalMachine.getNextCellsAfterPuttingInto(cells, x, y, token);
      const score = -(minMax(nextCells, reversed, depth - 1)).score;
      if (score > bestAction.score) {
        const action = { x, y };
        bestAction = { action, score };
      }
    }
  }

  // パスの場合は評価値として現在の盤面のスコアを返す
  if (bestAction.action === undefined) {
    return {
      action: undefined,
      score: evalScore(cells, token),
    };
  }

  return bestAction;
}
