module.exports = function() {
  return {
    label: "Previous Slide",
    execute: function(action) {
      if(this.connection) {
        this.connection.invoke("LeftArrowFromAdmin", this.config.code).catch(err => self.logger.error(err.toString()));
      }
    }
  }
}