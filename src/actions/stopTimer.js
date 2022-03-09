module.exports = function() {
  return {
    label: "Stop Timer",
    execute: function(action) {
      if(this.connection) {
        this.connection.invoke("StopTimer", this.config.code).catch(err => self.logger.error(err.toString()));
      }
    }
  }
}