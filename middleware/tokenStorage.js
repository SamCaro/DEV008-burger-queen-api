let globalToken = null;
module.exports = {
  setGlobalToken(token) {
    globalToken = token;
  },

  getGlobalToken() {
    return globalToken;
  },
};
