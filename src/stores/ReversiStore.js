import assign from 'object-assign';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ReversiActions from '../constants/ReversiActions';
import CellToken from '../constants/CellToken';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

const state = {
  running: false,
  cells: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  nextTurn: CellToken.Black,
  winner: undefined,
};


/**
 * 指定した手番の人の得点を計算する
 * 得点: 自分の色のコマの数
 *
 * @param {CellToken} 手番の人を示すコマ
 * @return {Number} 得点
 */
function getPointFor(token) {
  // flatten
  const flattenCells = Array.prototype.concat.apply([], state.cells);
  return flattenCells.filter((cell) => cell === token).length;
}

/**
 * ゲーム終了
 */
function finish() {
  state.running = false;

  const blackPoint = getPointFor(CellToken.Black);
  const whitePoint = getPointFor(CellToken.White);
  if (blackPoint > whitePoint) {
    state.winner = CellToken.Black;
  } else if (blackPoint < whitePoint) {
    state.winner = CellToken.White;
  } else {
    state.winner = undefined;
  }
}

/**
 * 白なら黒、黒なら白のコマを返す
 *
 * @param {CellToken} token コマ
 * @return {CellToken} 逆のコマ
 */
function reversedToken(token) {
  return token !== CellToken.Black ? CellToken.Black : CellToken.White;
}

/**
 * 指定したマスにコマを置いたら反転されるマスの一覧を取得する
 *
 * @param {Number} x 左から数えてマスの位置
 * @param {Number} y 上から数えてマスの位置
 * @param {CellToken} token コマ
 * @return {Array<Object>} マスの位置を {x, y} で表した配列
 */
function effectedCells(x, y, token) {
  const reversed = reversedToken(token);

  function effectedLine(dx, dy) {
    let [tx, ty] = [x + dx, y + dy];
    let line = [];
    // 隣接したマスが連続して逆のコマなら追加
    while (state.cells[ty] && state.cells[ty][tx] === reversed) {
      line.push({ x: tx, y: ty });
      [tx, ty] = [tx + dx, ty + dy];
    }
    // 挟めていなければ追加しない
    if (!(state.cells[ty] && state.cells[ty][tx] === token)) {
      line = [];
    }

    return line;
  }

  let cells = [];
  cells = cells.concat(effectedLine(-1, -1));
  cells = cells.concat(effectedLine(-1, 0));
  cells = cells.concat(effectedLine(-1, 1));
  cells = cells.concat(effectedLine(0, -1));
  cells = cells.concat(effectedLine(0, 1));
  cells = cells.concat(effectedLine(1, -1));
  cells = cells.concat(effectedLine(1, 0));
  cells = cells.concat(effectedLine(1, 1));
  return cells;
}

/**
 * 指定したマスにコマを置けるかどうか判定する
 *
 * @param {Number} x 左から数えてマスの位置
 * @param {Number} y 上から数えてマスの位置
 * @param {CellToken} token 置けるかどうか判定するコマ
 * @return {Boolean} 置ける場合は true / 置けない場合は false
 */
function canPutInto(x, y, token) {
  return state.cells[y][x] === CellToken.Empty
      && effectedCells(x, y, token).length > 0;
}

/**
 * 指定した手番の人が次に置けるマスが一つでも存在するかどうか
 *
 * @param {CellToken} token 次の手番の人の色を示すコマ
 * @return {Boolean} 存在するなら true / 存在しないなら false
 */
function hasPuttableCell(token) {
  for (let y = 0; y < state.cells.length; y++) {
    for (let x = 0; x < state.cells[y].length; x++) {
      if (canPutInto(x, y, token)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 白と黒の手番を入れ替えて、次のターンに送る
 */
function nextTurn() {
  const reversed = reversedToken(state.nextTurn);
  if (hasPuttableCell(reversed)) {
    state.nextTurn = reversed;
  } else {
    // 次のターンの人が置ける場所がなければパス
    if (! hasPuttableCell(state.nextTurn)) {
      // 両者置ける場所がなければゲーム終了
      finish();
    }
  }
}

/**
 * 指定したマスに次のコマを置く
 *
 * @param {Number} x 左から数えてマスの位置
 * @param {Number} y 上から数えてマスの位置
 */
function putToken(x, y) {
  if (!canPutInto(x, y, state.nextTurn)) {
    return;
  }

  state.cells[y][x] = state.nextTurn;
  const effected = effectedCells(x, y, state.nextTurn);
  for (let i = 0; i < effected.length; i++) {
    const cell = effected[i];
    state.cells[cell.y][cell.x] = state.nextTurn;
  }
  nextTurn();
}


const ReversiStore = assign({}, EventEmitter.prototype, {
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  getState() {
    return JSON.parse(JSON.stringify(state));
  },
});

AppDispatcher.register((action) => {
  switch (action.actionType) {
    case ReversiActions.GAME_START:
      state.running = true;
      ReversiStore.emitChange();
      break;

    case ReversiActions.PUT_TOKEN:
      putToken(action.x, action.y);
      ReversiStore.emitChange();
      break;

    default:
      // no-op
  }
});

export default ReversiStore;
