module.exports = function() {
  return {
    label: "Pause Timer",
    execute: function(action) {
      if(this.connection) {
        this.connection.invoke("PauseTimer", this.config.code).catch(err => self.logger.error(err.toString()));
      }
    }
  }
}