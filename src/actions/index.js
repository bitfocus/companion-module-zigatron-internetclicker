const actions = function () {
  return {
    next: require("./next")(),
    previous: require("./previous")(),
    startTimer: require("./startTimer")(),
    pauseTimer: require("./pauseTimer")(),
    stopTimer: require("./stopTimer")(),
    sendMessage: require("./sendMessage")(),
    togglePresenterAccess: require("./togglePresenterAccess")()
  }
}();

module.exports.actionList = actions;

exports.executeAction = function (action) {
  const item = actions[action.action];
  item.execute.bind(this)(action);
}