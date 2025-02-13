import Next from './next.js'
import PauseTimer from './pauseTimer.js'
import Previous from './previous.js'
import SendMessage from './sendMessage.js'
import StartTimer from './startTimer.js'
import StopTimer from './stopTimer.js'
import ChangeTimer from './changeTimer.js'
import TogglePresenterAccess from './togglePresenterAccess.js'
import ToggleIndividualPresenterAccess from './toggleIndividualPresenterAccess.js'
import PromptForNames from './promptForNames.js'
import Connect from './connect.js'
import Disconnect from './disconnect.js'

export default function (self) {
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
