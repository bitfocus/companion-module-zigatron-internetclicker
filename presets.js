import { combineRgb } from '@companion-module/base'
import Settings from './settings.js'

function generatePresenterToggleButtons() {
	const presets = {}
	for (let index = 1; index <= Settings.NumberOfPresenters; index++) {
		const zero_index = index - 1
		const preset = {
			category: 'Presenter Controls',
			name: `Toggle Presenter ${index}`,
			type: 'button',

			// Style options for the button
			style: {
				text: `$(zigatron-internetclicker:presenter_${index}_name)`, // Use a variable for the text
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},

			// Add your feedbacks
			feedbacks: [
				{
					feedbackId: 'toggle_individual_presenter_access',
					options: {
						presenter_index: zero_index,
						state_notconnected_bg: 0xffffff,
						state_notconnected_color: 0x000000,
						state_active_bg: 0x00cc00,
						state_active_color: 0x000000,
						state_inactive_bg: 0xff0000,
						state_inactive_color: 0x000000,
					},
				},
			],

			// Optional steps to run when the preset is added
			steps: [
				{
					down: [
						{
							actionId: 'toggleIndividualPresenterAccess',
							options: {
								presenter_index: zero_index,
							},
						},
					],
					up: [],
				},
			],
		}

		preset.previewStyle = { 
			...preset.style,
			text: preset.name,
			size: '14'
		}

		presets[`toggle_presenter_${index}`] = preset
	}

	return presets
}

export default generatePresenterToggleButtons()
