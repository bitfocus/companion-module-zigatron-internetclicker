module.exports = function() {
  return {
    label: "Start Timer",
    execute: function(action) {
      if(this.connection) {
        this.connection.invoke("StartTimer", this.config.code, action.options.minutes, action.options.seconds, action.options.isCountUp).catch(err => self.logger.error(err.toString()));
      }
    },
    options: [
      {
        type: 'number',
        label: 'Minutes',
        id: 'minutes',
        default: 0,
        step: 1,
        required: true,
        range: false
      },
      {
        type: 'number',
        label: 'Seconds',
        id: 'seconds',
        default: 0,
        step: 1,
        required: true,
        range: false
      },
      {
        type: 'checkbox',
        label: 'Count Up',
        tooltip: 'Once the timer is finished should it continue counting up',
        id: 'isCountUp',
        default: false
      }
    ]
  }
}