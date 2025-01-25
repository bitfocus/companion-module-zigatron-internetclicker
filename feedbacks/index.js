const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		control_presenter_access: {
			type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
			name: 'Control Presenter Access Status',
			label: 'Control Presenter Access Status',
			description: 'Whether this code has presenter access control enabled',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
				text: 'On',
			},
			// options is how the user can choose the condition the feedback activates for
			options: [],
			callback: (feedback) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				return self.room.controlPresenterAccess
				//return true;
			},
		},
		toggle_individual_presenter_access: {
			type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
			name: 'Toggle Presenter Access Status',
			label: 'Toggle Presenter Access Status',
			description: 'Whether this code has presenter access control enabled',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
				text: 'On',
			},
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					type: 'number',
					label: 'Presenter number (0 indexed)',
					id: 'presenter_index',
					default: '',
					useVariables: true,
				},
			],
			callback: async (feedback, context) => {
				// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
				if (self.room.users.indexOf(feedback.options.presenter_index) === -1) {
					return false
				}
				return self.room.users[feedback.options.presenter_index].isActive
				//return true;
			},
		},
	})
}
