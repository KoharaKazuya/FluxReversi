import assign from 'object-assign';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ReversiActions from '../constants/ReversiActions';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

const state = {
  running: false,
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

    default:
      // no-op
  }
});

export default ReversiStore;
