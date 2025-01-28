const Settings = require('./settings')

function generatePresenterToggleButtons() {
    const presets = {}
    for (let index = 1; index <= Settings.NumberOfPresenters; index++) {
        const zero_index = index - 1;
        presets[`toggle_presenter_${index}`] = {
            category: 'Presenter Controls',
            name: `Toggle Presenter ${index}`,
            type: 'button',
            
            // Style options for the button
            style: {
                text: `$(zigatron-internetclicker:presenter_${index}_name)`,      // Use a variable for the text
                size: 'auto',
            },
            
            // Add your feedbacks
            feedbacks: [
                {
                    feedbackId: 'toggle_individual_presenter_access',
                    options: {
                        presenter_index: zero_index,
                        state_notconnected_bg: 0xFFFFFF,
                        state_notconnected_color: 0x000000,
                        state_active_bg: 0x00CC00,
                        state_active_color: 0x000000,
                        state_inactive_bg: 0xFF0000,
                        state_inactive_color: 0x000000,
                    },
                }
            ],
            
            // Optional steps to run when the preset is added
            steps: [
                {
                    down: [
                        {
                            actionId: 'toggleIndividualPresenterAccess',
                            options: {
                                presenter_index: zero_index
                            }
                        }
                    ],
                    up: [],
                },
            ],
        }        
    }

    return presets;
}

module.exports = generatePresenterToggleButtons()