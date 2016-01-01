import assign from 'object-assign';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ReversiPlayer from './ReversiPlayer';
import ReversiActions from '../constants/ReversiActions';
import CellToken from '../constants/CellToken';
import ReversiPlayers from '../constants/ReversiPlayers';
import { EventEmitter } from 'events';
import ReversiEvalMachine from './ReversiEvalMachine';

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

const players = {
  [CellToken.Black]: new ReversiPlayer(ReversiPlayers.Human, CellToken.Black),
  [CellToken.White]: new ReversiPlayer(ReversiPlayers.EstimatedWeightAI, CellToken.White),
};


/**
 * ゲーム開始
 */
function start() {
  state.running = true;
}

/**
 * ゲーム終了
 */
function finish() {
  state.running = false;

  const blackPoint = ReversiEvalMachine.getScoreFor(state.cells, CellToken.Black);
  const whitePoint = ReversiEvalMachine.getScoreFor(state.cells, CellToken.White);
  if (blackPoint > whitePoint) {
    state.winner = CellToken.Black;
  } else if (blackPoint < whitePoint) {
    state.winner = CellToken.White;
  } else {
    state.winner = undefined;
  }
}

/**
 * 白と黒の手番を入れ替えて、次のターンに送る
 */
function nextTurn() {
  const reversed = ReversiEvalMachine.reversedToken(state.nextTurn);
  if (ReversiEvalMachine.hasPuttableCell(state.cells, reversed)) {
    state.nextTurn = reversed;
  } else {
    // 次のターンの人が置ける場所がなければパス
    if (! ReversiEvalMachine.hasPuttableCell(state.cells, state.nextTurn)) {
      // 両者置ける場所がなければゲーム終了
      finish();
    }
  }

  // 次の手番のプレイヤーの手を決定する
  if (state.running) {
    const player = players[state.nextTurn];
    const action = player.getNextAction(state.cells);
    // 手が未定義（＝人間に任せる）でなければ、手を実行する
    if (action !== undefined) {
      putToken(action.x, action.y);
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
  if (! ReversiEvalMachine.canPutInto(state.cells, x, y, state.nextTurn)) {
    return;
  }
  state.cells = ReversiEvalMachine.getNextCellsAfterPuttingInto(state.cells, x, y, state.nextTurn);
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
      start();
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
