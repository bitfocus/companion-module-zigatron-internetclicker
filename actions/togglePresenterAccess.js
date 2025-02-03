module.exports = function (self) {
	return {
		name: 'Toggle Presenter Access',
		callback: async (event) => {
			self.logger.info('Toggling room presenter access')

			if (self.connection) {
				self.connection
					.invoke('ToggleRoomPresenterAccess', self.config.code)
					.then(() => {
						self.room.controlPresenterAccess = !self.room.controlPresenterAccess
						self.checkFeedbacks('control_presenter_access')
					})
					.catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
