const Next = require('./next')
const PauseTimer = require('./pauseTimer')
const Previous = require('./previous')
const SendMessage = require('./sendMessage')
const StartTimer = require('./startTimer')
const StopTimer = require('./stopTimer')
const TogglePresenterAccess = require('./togglePresenterAccess')
const ToggleIndividualPresenterAccess = require('./toggleIndividualPresenterAccess')
const PromptForNames = require('./promptForNames');

module.exports = function (self) {
	self.setActionDefinitions({
		next: Next(self),
		previous: Previous(self),
		pauserTimer: PauseTimer(self),
		sendMessage: SendMessage(self),
		startTimer: StartTimer(self),
		stopTimer: StopTimer(self),
		togglePresenterAccess: TogglePresenterAccess(self),
		toggleIndividualPresenterAccess: ToggleIndividualPresenterAccess(self),
		promptForNames: PromptForNames(self),
	})
}
