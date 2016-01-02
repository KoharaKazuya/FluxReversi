// WebWorker のファイルパスのこのファイルの相対パスから取得できるように、
// このファイルのパスを取得する
const jsPath = (() => {
  const scripts = document.querySelectorAll('script');
  for (let i = 0; i < scripts.length; i++) {
    const matches = scripts[i].src.match(/^(.*\/)bundle\.js$/);
    if (matches) {
      return matches[1];
    }
  }
})();

const aiWorker = new Worker(jsPath + 'ReversiPlayerAiWorker.js');

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
