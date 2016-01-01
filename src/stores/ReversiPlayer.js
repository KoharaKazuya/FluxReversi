import ReversiPlayers from '../constants/ReversiPlayers';
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

/**
 * 盤面の得点評価関数
 *
 * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
 * @param {CellToken} 得点を評価したいコマの色
 * @return {Number} 得点
 */
function evalScore(estimatedCells, token) {
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

export default class ReversiPlayer {
  /**
   * コンストラクター
   *
   * @param {ReversiPlayers} type プレイヤーの種類
   * @param {CellToken} token コマの色
   */
  constructor(type, token) {
    this.type = type;
    this.token = token;
  }

  /**
   * 次の一手を取得する
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @return {Object|undefined} 次の手を示す {x, y} オブジェクト、もしくは undefined (= 人のプレイヤーが決定)
   */
  getNextAction(cells) {
    if (! ReversiEvalMachine.hasPuttableCell(cells, this.token)) {
      // 置ける場所がない場合、決定できない
      return undefined;
    }

    switch (this.type) {
      case ReversiPlayers.RandomAI:
        // 置ける場所の中から、ランダムに選択する
        let action;
        do {
          const y = Math.floor(Math.random() * cells.length);
          const x = Math.floor(Math.random() * cells[y].length);
          action = { x, y };
        } while (! ReversiEvalMachine.canPutInto(cells, action.x, action.y, this.token));
        return action;

      case ReversiPlayers.WeightedAI:
        // 置ける場所の中から最も重み付けが大きいマスを選択する
        action = { x: 0, y: 0 };
        let actionWeight = Number.NEGATIVE_INFINITY;
        for (let y = 0; y < weight.length; y++) {
          for (let x = 0; x < weight[y].length; x++) {
            if (ReversiEvalMachine.canPutInto(cells, x, y, this.token)
                && weight[y][x] > actionWeight) {
              action = { x, y };
              actionWeight = weight[y][x];
            }
          }
        }
        return action;

      case ReversiPlayers.EstimatedWeightAI:
        // 全てのマスにコマを置いてみて、評価値の合計が最も大きかった場合のマスを選択する
        return minMax(cells, this.token, 1).action;

      case ReversiPlayers.MinMaxAI:
        // Min-Max 法
        return minMax(cells, this.token, 3).action;

      default:
        return undefined;
    }
  }
}
