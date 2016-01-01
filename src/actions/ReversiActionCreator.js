import AppDispatcher from '../dispatcher/AppDispatcher';
import ReversiActions from '../constants/ReversiActions';

export default {
  startGame() {
    AppDispatcher.dispatch({
      actionType: ReversiActions.GAME_START,
    });
  },

  putToken(x, y) {
    AppDispatcher.dispatch({
      actionType: ReversiActions.PUT_TOKEN,
      x, y,
    });
  },

  changePlayer(token, playerType) {
    AppDispatcher.dispatch({
      actionType: ReversiActions.CHANGE_PLAYER,
      token, playerType,
    });
  },
};
