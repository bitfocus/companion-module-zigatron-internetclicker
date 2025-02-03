const { combineRgb } = require('@companion-module/base')
const Settings = require('../settings')
const { ConnectionState } = require('../enums')

const buildPresenterOptions = () =>
	Array.from({ length: Settings.NumberOfPresenters }, (_, i) => ({
		id: i,
		label: i + 1,
	}))

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
			},
		},
		toggle_individual_presenter_access: {
			type: 'advanced', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
			name: 'Toggle Presenter Access Status',
			label: 'Toggle Presenter Access Status',
			description: 'Whether this code has presenter access control enabled',
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					id: 'presenter_index',
					type: 'dropdown',
					label: 'Presenter number',
					choices: buildPresenterOptions(),
					default: 0,
				},
				// not connected styles
				{
					type: 'colorpicker',
					label: 'Not Connected Background Color',
					id: 'state_notconnected_bg',
					default: '0xFFFFFF',
				},
				{
					type: 'colorpicker',
					label: 'Not Connected Text Color',
					id: 'state_notconnected_color',
					default: '0x000000',
				},
				// active styles
				{
					type: 'colorpicker',
					label: 'Active to Click Background Color',
					id: 'state_active_bg',
					default: '0x00CC00',
				},
				{
					type: 'colorpicker',
					label: 'Active to Click Text Color',
					id: 'state_active_color',
					default: '0x000000',
				},
				// inactive styles
				{
					// Color picker for State 1
					type: 'colorpicker',
					label: 'Not Active to Click Background Color',
					id: 'state_inactive_bg',
					default: '0xFF0000',
				},
				{
					type: 'colorpicker',
					label: 'Not Active to Click Text Color',
					id: 'state_inactive_color',
					default: '0x000000',
				},
			],
			callback: (feedback, context) => {
				const options = feedback.options
				const state = {
					notconnected: { color: options.state_notconnected_color, bgcolor: options.state_notconnected_bg },
					active: { color: options.state_active_color, bgcolor: options.state_active_bg },
					inactive: { color: options.state_inactive_color, bgcolor: options.state_inactive_bg },
				}

				const presenter = self.room.users?.[options.presenter_index]
				if (!presenter) {
					return state.notconnected
				}

				return presenter.isActive ? state.active : state.inactive
			},
		},
		connection_state: {
			type: 'advanced',
			name: 'Connection State',
			label: 'Connection State',
			description: "The state of the connection to Internet Clicker's live service",
			options: [
				// not connected styles
				{
					type: 'colorpicker',
					label: 'Connecting Background Color',
					id: 'state_connecting_bg',
					default: '0xFFFFFF',
				},
				{
					type: 'colorpicker',
					label: 'Connecting Text Color',
					id: 'state_connecting_color',
					default: '0x000000',
				},
				// active styles
				{
					type: 'colorpicker',
					label: 'Connected Background Color',
					id: 'state_connected_bg',
					default: '0x00CC00',
				},
				{
					type: 'colorpicker',
					label: 'Connected Text Color',
					id: 'state_connected_color',
					default: '0x000000',
				},
				// inactive styles
				{
					type: 'colorpicker',
					label: 'Disconnected Background Color',
					id: 'state_disconnected_bg',
					default: '0xFF0000',
				},
				{
					type: 'colorpicker',
					label: 'Disconnected Text Color',
					id: 'state_disconnected_color',
					default: '0x000000',
				},
			],
			callback: (feedback, context) => {
				const state = {}
				const options = feedback.options

				state[ConnectionState.Connecting] = {
					color: options.state_connecting_color,
					bgcolor: options.state_connecting_bg,
				}
				state[ConnectionState.Connected] = { color: options.state_connected_color, bgcolor: options.state_connected_bg }
				state[ConnectionState.Disconnected] = {
					color: options.state_disconnected_color,
					bgcolor: options.state_disconnected_bg,
				}

				const currentState = self.getHubConnectionState()
				return state?.[currentState] ?? state[ConnectionState.Disconnected]
			},
		},
	})
}
