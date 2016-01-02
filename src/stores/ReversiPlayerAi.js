const aiWorker = new Worker('ReversiPlayerAiWorker.js');

export default {
  getNextActionByAi(cells, token, depth) {
    return new Promise((resolve, reject) => {
      aiWorker.onmessage = (e) => {
        const action = e.data;
        if (action) {
          resolve(action);
        } else {
          reject();
        }
      };

      aiWorker.postMessage({ cells, token, depth });
    });
  },
};
