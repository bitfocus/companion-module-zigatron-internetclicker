module.exports = function (self) {
	return {
		name: 'Stop Timer',
		callback: async (event) => {
			if (self.connection) {
				self.connection.invoke('StopTimer', self.config.code).catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
