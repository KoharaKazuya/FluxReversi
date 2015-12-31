import assign from 'object-assign';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ReversiActions from '../constants/ReversiActions';
import CellToken from '../constants/CellToken';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

const state = {
  running: false,
  cells: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  nextTurn: CellToken.Black,
};

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
      if (state.cells[action.y][action.x] === CellToken.Empty) {
        state.cells[action.y][action.x] = state.nextTurn;
        state.nextTurn = state.nextTurn !== CellToken.Black ? CellToken.Black : CellToken.White;
      }
      ReversiStore.emitChange();
      break;

    default:
      // no-op
  }
});

export default ReversiStore;
