module.exports = function() {
  return {
    label: "Send Message",
    execute: function(action) {
      if(this.connection) {
        this.connection.invoke("SendMessage", this.config.code, action.options.text).catch(err => self.logger.error(err.toString()));
      }
    },
    options: [
      {
        type: 'textinput',
        label: 'Text',
        id: 'text',
      }
    ]
  }
}