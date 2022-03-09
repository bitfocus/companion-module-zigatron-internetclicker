module.exports = function () {
  return {
    label: "Toggle Presenter Access",
    execute: function () {
      if (this.connection) {
        this.connection.invoke("ToggleRoomPresenterAccess", this.config.code)
          .then(() => {
            this.room.controlPresenterAccess = !this.room.controlPresenterAccess;
            this.checkFeedbacks('control_presenter_access');
          })
          .catch(err => self.logger.error(err.toString()));
      }
    }
  }
}