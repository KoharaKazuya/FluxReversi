import CellToken from '../constants/CellToken';

const ReversiEvalMachine = {
  /**
   * 指定した手番の人の得点を計算する
   * 得点: 自分の色のコマの数
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @param {CellToken} 手番の人を示すコマ
   * @return {Number} 得点
   */
  getScoreFor(cells, token) {
    const flattenCells = Array.prototype.concat.apply([], cells);  // flatten
    return flattenCells.filter((cell) => cell === token).length;
  },

  /**
   * 白なら黒、黒なら白のコマを返す
   *
   * @param {CellToken} token コマ
   * @return {CellToken} 逆のコマ
   */
  reversedToken(token) {
    return token !== CellToken.Black ? CellToken.Black : CellToken.White;
  },

  /**
   * 指定したマスにコマを置いたら反転されるマスの一覧を取得する
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @param {Number} x 左から数えてマスの位置
   * @param {Number} y 上から数えてマスの位置
   * @param {CellToken} token コマ
   * @return {Array<Object>} マスの位置を {x, y} で表した配列
   */
  effectedCells(cells, x, y, token) {
    const reversed = ReversiEvalMachine.reversedToken(token);

    function effectedLine(dx, dy) {
      let [tx, ty] = [x + dx, y + dy];
      let line = [];
      // 隣接したマスが連続して逆のコマなら追加
      while (cells[ty] && cells[ty][tx] === reversed) {
        line.push({ x: tx, y: ty });
        [tx, ty] = [tx + dx, ty + dy];
      }
      // 挟めていなければ追加しない
      if (!(cells[ty] && cells[ty][tx] === token)) {
        line = [];
      }

      return line;
    }

    let effectedCells = [];
    effectedCells = effectedCells.concat(effectedLine(-1, -1));
    effectedCells = effectedCells.concat(effectedLine(-1, 0));
    effectedCells = effectedCells.concat(effectedLine(-1, 1));
    effectedCells = effectedCells.concat(effectedLine(0, -1));
    effectedCells = effectedCells.concat(effectedLine(0, 1));
    effectedCells = effectedCells.concat(effectedLine(1, -1));
    effectedCells = effectedCells.concat(effectedLine(1, 0));
    effectedCells = effectedCells.concat(effectedLine(1, 1));
    return effectedCells;
  },

  /**
   * 指定したマスにコマを置いた場合の次の盤面を返す
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @param {Number} x 左から数えてマスの位置
   * @param {Number} y 上から数えてマスの位置
   * @param {CellToken} token 置くコマ
   * @return {Array<Array<Number>>} 次の盤面を示す２次元配列
   */
  getNextCellsAfterPuttingInto(cells, x, y, token) {
    const nextCells = JSON.parse(JSON.stringify(cells));
    if (! ReversiEvalMachine.canPutInto(cells, x, y, token)) {
      // 指定されたマスに置けない場合は、盤面は変わらない
      return nextCells;
    }

    nextCells[y][x] = token;
    const effected = ReversiEvalMachine.effectedCells(cells, x, y, token);
    for (let i = 0; i < effected.length; i++) {
      const cell = effected[i];
      nextCells[cell.y][cell.x] = token;
    }
    return nextCells;
  },

  /**
   * 指定したマスにコマを置けるかどうか判定する
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @param {Number} x 左から数えてマスの位置
   * @param {Number} y 上から数えてマスの位置
   * @param {CellToken} token 置けるかどうか判定するコマ
   * @return {Boolean} 置ける場合は true / 置けない場合は false
   */
  canPutInto(cells, x, y, token) {
    return cells[y][x] === CellToken.Empty
        && ReversiEvalMachine.effectedCells(cells, x, y, token).length > 0;
  },

  /**
   * 指定した手番の人が次に置けるマスが一つでも存在するかどうか
   *
   * @param {Array<Array<Number>>} cells 盤面を示す２次元配列
   * @param {CellToken} token 次の手番の人の色を示すコマ
   * @return {Boolean} 存在するなら true / 存在しないなら false
   */
  hasPuttableCell(cells, token) {
    for (let y = 0; y < cells.length; y++) {
      for (let x = 0; x < cells[y].length; x++) {
        if (ReversiEvalMachine.canPutInto(cells, x, y, token)) {
          return true;
        }
      }
    }
    return false;
  },
};

export default ReversiEvalMachine;
