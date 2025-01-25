const Settings = require('./settings')

const Variables = {}

const SetupDefinitions = function (self) {
	const vars = [];

	for (let i = 1; i <= Settings.NumberOfPresenters; i++) {
		const variableId = DefinitionGenerator.PresenterName(i)
		vars.push({
			variableId,
			name: `Presenter ${i} name`
		});

		Variables[variableId] = undefined;
	}

	// for (let i = 1; i <= Config.NumberOfPresenters; i++) {
	// 	Variables[DefinitionGenerator.PresenterName(i)] = {
	// 		name: `Presenter ${i} name`
	// 	}
	// }

	// for (const [key, value] of Object.entries(Variables)) {
	// 	vars.push({
	// 		variableId: key,
	// 		name: value.name
	// 	})
	// }

	self.setVariableDefinitions(vars)
}

const DefinitionGenerator = {
	PresenterName: (num) => `presenter_${num}_name`
}

module.exports = {
	Variables,
	SetupDefinitions,
	DefinitionGenerator
}