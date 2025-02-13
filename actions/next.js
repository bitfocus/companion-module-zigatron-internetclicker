export default function (self) {
	return {
		name: 'Next Slide',
		callback: async (event) => {
			if (self.connection) {
				self.connection
					.invoke('RightArrowFromAdmin', self.config.code)
					.catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
