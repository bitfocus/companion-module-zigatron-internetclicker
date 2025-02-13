import Settings from './settings.js'
import { ConnectionState } from './enums.js'

const Keys = {
	ConnectionState: 'connection_state',
	PresenterName: (num) => `presenter_${num}_name`,
}

const Values = {}

const SetupDefinitions = function (self) {
	const vars = []

	// presenter variables
	for (let i = 1; i <= Settings.NumberOfPresenters; i++) {
		const variableId = Keys.PresenterName(i)
		vars.push({
			variableId,
			name: `Presenter ${i} name`,
		})

		Values[variableId] = self.config.unknownPresenterName ?? ''
	}

	// connection status
	vars.push({
		variableId: Keys.ConnectionState,
		name: 'Connection Status',
	})
	Values[Keys.ConnectionState] = ConnectionState.Disconnected

	self.setVariableDefinitions(vars)
}

export default {
	Keys,
	Values,
	SetupDefinitions,
}
