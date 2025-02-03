const Next = require('./next')
const PauseTimer = require('./pauseTimer')
const Previous = require('./previous')
const SendMessage = require('./sendMessage')
const StartTimer = require('./startTimer')
const StopTimer = require('./stopTimer')
const ChangeTimer = require('./changeTimer')
const TogglePresenterAccess = require('./togglePresenterAccess')
const ToggleIndividualPresenterAccess = require('./toggleIndividualPresenterAccess')
const PromptForNames = require('./promptForNames')
const Connect = require('./connect')
const Disconnect = require('./disconnect')

module.exports = function (self) {
	self.setActionDefinitions({
		next: Next(self),
		previous: Previous(self),
		pauserTimer: PauseTimer(self),
		sendMessage: SendMessage(self),
		startTimer: StartTimer(self),
		stopTimer: StopTimer(self),
		changeTimer: ChangeTimer(self),
		togglePresenterAccess: TogglePresenterAccess(self),
		toggleIndividualPresenterAccess: ToggleIndividualPresenterAccess(self),
		promptForNames: PromptForNames(self),
		connect: Connect(self),
		disconnect: Disconnect(self),
	})
}
