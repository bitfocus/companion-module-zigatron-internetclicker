module.exports = function (self) {
	return {
		name: 'Pause Timer',
		callback: async (event) => {
			if (self.connection) {
				self.connection.invoke('PauseTimer', self.config.code).catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
