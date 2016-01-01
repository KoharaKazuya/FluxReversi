import ReversiPlayers from '../constants/ReversiPlayers';
import ReversiEvalMachine from './ReversiEvalMachine';


const weight = [
  [-30, -12, 0, -1, -1, 0, -12, -30],
  [-12, -15, -3, -3, -3, -3, -15, -12],
  [0, -3, -0, -1, -1, 0, -3, 0],
  [-1, -3, -1, -1, -1, -1, -3, -1],
  [-1, -3, -1, -1, -1, -1, -3, -1],
  [0, -3, -0, -1, -1, 0, -3, 0],
  [-12, -15, -3, -3, -3, -3, -15, -12],
  [-30, -12, 0, -1, -1, 0, -12, -30],
];

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
        action = { x: 0, y: 0 };
        actionWeight = Number.NEGATIVE_INFINITY;

        const _token = this.token;
        /**
         * 盤面の得点評価関数
         */
        function evalScore(estimatedCells) {
          let score = 0;
          for (let y = 0; y < estimatedCells.length; y++) {
            for (let x = 0; x < estimatedCells[y].length; x++) {
              if (estimatedCells[y][x] === _token) {
                score += weight[y][x];
              }
            }
          }
          return score;
        }

        for (let y = 0; y < cells.length; y++) {
          for (let x = 0; x < cells[y].length; x++) {
            if (! ReversiEvalMachine.canPutInto(cells, x, y, this.token)) {
              continue;  // 置けない場合はスキップ
            }
            const score = evalScore(ReversiEvalMachine.getNextCellsAfterPuttingInto(cells, x, y, this.token));
            if (score > actionWeight) {
              action = { x, y };
              actionWeight = score;
            }
          }
        }
        return action;

      default:
        return undefined;
    }
  }
}
