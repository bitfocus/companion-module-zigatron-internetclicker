export default function (self) {
	return {
		name: 'Previous Slide',
		callback: async (event) => {
			if (self.connection) {
				self.connection.invoke('LeftArrowFromAdmin', self.config.code).catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
