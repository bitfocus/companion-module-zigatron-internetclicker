module.exports = function() {
  const feedbacks = {};
  //feedbacks['toggle_presenter_access'] = require(`./togglePresenterAccess`).bind(this)(); //load(`./togglePresenterAccess`);
  feedbacks["toggle_presenter_access"] = {
    type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
    label: 'Control Presenter Access Status',
    description: 'Whether this code has presenter access control enabled',
    style: {
      // The default style change for a boolean feedback
      // The user will be able to customise these values as well as the fields that will be changed
      color: this.rgb(0, 0, 0),
      bgcolor: this.rgb(255, 0, 0),
      text: "On"
    },
    // options is how the user can choose the condition the feedback activates for
    options: [],
    callback: function (feedback) {
      // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
      return this.room.controlPresenterAccess;
    }
  };

  return feedbacks;
}