module.exports = function (self) {
	return {
		name: 'Start Timer',
		callback: async (event) => {
			if (self.connection) {
				self.connection
					.invoke('StartTimer', self.config.code, event.options.minutes, event.options.seconds, event.options.isCountUp)
					.catch((err) => self.log('error', err.toString()))
			}
		},
		options: [
			{
				type: 'number',
				label: 'Minutes',
				id: 'minutes',
				default: 0,
				step: 1,
				required: true,
				range: false,
			},
			{
				type: 'number',
				label: 'Seconds',
				id: 'seconds',
				default: 0,
				step: 1,
				required: true,
				range: false,
			},
			{
				type: 'checkbox',
				label: 'Count Up',
				tooltip: 'Once the timer is finished should it continue counting up',
				id: 'isCountUp',
				default: false,
			},
		],
	}
}
