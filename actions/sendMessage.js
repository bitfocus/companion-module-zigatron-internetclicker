module.exports = function (self) {
	return {
		name: 'Send Message',
		callback: async (event) => {
			if (self.connection) {
				self.connection
					.invoke('SendMessage', self.config.code, event.options.text)
					.catch((err) => self.log('error', err.toString()))
			}
		},
		options: [
			{
				type: 'textinput',
				label: 'Text',
				id: 'text',
			},
		],
	}
}
