const Settings = require('./settings')
const { ConnectionStatus } = require('./enums')

const Names = {
	ConnectionStatus: 'connection_status'
}

const Variables = {}

const SetupDefinitions = function (self) {
	const vars = []

	// presenter variables
	for (let i = 1; i <= Settings.NumberOfPresenters; i++) {
		const variableId = DefinitionGenerator.PresenterName(i)
		vars.push({
			variableId,
			name: `Presenter ${i} name`
		})

		Variables[variableId] = self.config.unknownPresenterName ?? ''
	}

	// connection status
	vars.push({
		variableId: Names.ConnectionStatus,
		name: 'Connection Status'
	})
	Variables[Names.ConnectionStatus] = ConnectionStatus.Disconnected

	self.setVariableDefinitions(vars)
}

const DefinitionGenerator = {
	PresenterName: (num) => `presenter_${num}_name`
}

module.exports = {
	Variables,
	SetupDefinitions,
	DefinitionGenerator,
	Names
}