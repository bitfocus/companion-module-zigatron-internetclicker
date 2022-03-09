module.exports = function () {
  return {
    label: "Next Slide",
    execute: function () {
      if (this.connection) {
        this.connection.invoke("RightArrowFromAdmin", this.config.code).catch(err => self.logger.error(err.toString()));
      }
    }
  }
}